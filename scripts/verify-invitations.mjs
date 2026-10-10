import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// Run with: node scripts/verify-invitations.mjs
// Uses the actual source modules; no external requests are sent.
const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => fs.readFile(path.join(root, file), "utf8");
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const translationUrl = moduleUrl(await read("src/data/translations.js"));
const { translations, localizeInvitation } = await import(translationUrl);
const { sanitizeGuestName } = await import(moduleUrl(await read("src/lib/personalization.js")));
const { createCalendarFile, createGoogleCalendarUrl } = await import(moduleUrl(await read("src/lib/calendar.js")));

// Next.js resolves extensionless imports and JSON through its bundler. Adapt
// those imports for plain Node without modifying production files or adding deps.
const invitationSource = (await read("src/data/invitations.js"))
  .replace('import backgroundVideos from "./background-videos.json";', `const backgroundVideos = ${await read("src/data/background-videos.json")};`)
  .replace('import videoAssets from "./video-assets.json";', `const videoAssets = ${await read("src/data/video-assets.json")};`)
  .replace('"./translations"', JSON.stringify(translationUrl));
const { getInvitation } = await import(moduleUrl(invitationSource));
const canonical = {
  wedding: {
    date: "Thursday, 26 November 2026",
    displayDate: "Thursday, 26th November 2026",
    dateParts: { weekday: "Thursday", day: "26", month: "November", year: "2026" },
    countdownTarget: "2026-11-26T09:16:00+05:30",
    schedule: [
      { title: "Poruwa Ceremony", time: "9:16 AM" },
      { title: "Registration", time: "10:10 AM" },
      { title: "Departure of the Newlyweds", time: "4:08 PM" },
    ],
    mapsUrl: "https://maps.app.goo.gl/urnjWCBNcUmjTYrZ7",
    contact: { phone: "+94775339705", display: "077 533 9705" },
    calendar: {
      allDay: false, start: "20261126T091600", end: "20261126T160800",
      title: "The Wedding of Janith & Pradeepa",
      description: "Poruwa Ceremony at 9:16 AM, Registration at 10:10 AM, and Departure of the Newlyweds at 4:08 PM.",
      location: "Hemandra Grand Hotel",
    },
  },
  homecoming: {
    date: "Monday, 30 November 2026",
    displayDate: "Monday, 30th November 2026",
    dateParts: { weekday: "Monday", day: "30", month: "November", year: "2026" },
    countdownTarget: "2026-11-30T11:08:00+05:30",
    arrival: {
      title: "Arrival of the Newlyweds", time: "11:08 AM",
      text: "The celebration will continue throughout the day and into the evening.",
    },
    mapsUrl: "https://share.google/yjhuVkqNNSOrz0HFx",
    contact: { phone: "+94705525625", display: "0705 525 625" },
    calendar: {
      allDay: true, startDate: "20261130", endDate: "20261201",
      title: "Janith & Pradeepa — Homecoming Celebration",
      description: "Arrival of the Newlyweds — 11:08 AM. The celebration continues throughout the day and into the evening.",
      location: "Senwin Mandeer, Thalgaswala",
    },
  },
};

test("both invitations retain their factual dates, event times, contacts and links", () => {
  for (const [slug, expected] of Object.entries(canonical)) {
    const invitation = getInvitation(slug);
    for (const key of ["date", "displayDate", "dateParts", "countdownTarget", "schedule", "arrival", "calendar"]) {
      assert.deepEqual(invitation[key], expected[key], `${slug}.${key}`);
    }
    assert.equal(invitation.location.mapsUrl, expected.mapsUrl);
    assert.deepEqual(invitation.location.contact, expected.contact);
    assert.ok(invitation.videos.opening.startsWith(`/assets/${slug}/media/`) && /\.[a-f0-9]{12}\.mp4$/.test(invitation.videos.opening));
    assert.equal(invitation.music, `/assets/${slug}/music/${slug}-theme.mp3`);
    assert.ok(invitation.videoPosters.opening);
  }
  assert.equal(getInvitation("unknown"), undefined);
});

test("English and Sinhala dictionaries have complete matching UI keys and template variables", async () => {
  assert.deepEqual(Object.keys(translations.en).sort(), Object.keys(translations.si).sort());
  for (const [key, value] of Object.entries(translations.en)) {
    if (typeof value !== "string") continue;
    assert.ok(value.trim(), `English ${key}`);
    assert.ok(translations.si[key].trim(), `Sinhala ${key}`);
    assert.ok(!/\?{3,}/.test(translations.si[key]), `Sinhala encoding for ${key}`);
    const variables = (text) => (text.match(/\{\w+\}/g) || []).sort();
    assert.deepEqual(variables(value), variables(translations.si[key]), `Template variables for ${key}`);
  }
  for (const slug of Object.keys(canonical)) {
    assert.deepEqual(Object.keys(translations.en.invitationCopy[slug]).sort(), Object.keys(translations.si.invitationCopy[slug]).sort());
  }
  const checkDirectory = async (directory) => {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await checkDirectory(file);
      else if (/\.(js|jsx)$/.test(file)) {
        const source = await fs.readFile(file, "utf8");
        for (const match of source.matchAll(/\bt\(["']([^"']+)["']/g)) {
          assert.equal(typeof translations.en[match[1]], "string", `EN key ${match[1]} in ${file}`);
          assert.equal(typeof translations.si[match[1]], "string", `SI key ${match[1]} in ${file}`);
        }
      }
    }
  };
  await checkDirectory(path.join(root, "src"));
});

test("localizing narrative keeps media, canonical calendar data, phone numbers and event times", () => {
  for (const slug of Object.keys(canonical)) {
    const original = getInvitation(slug);
    const localized = localizeInvitation(original, "si");
    assert.equal(localizeInvitation(original, "en"), original);
    for (const key of ["slug", "theme", "couple", "groom", "bride", "countdownTarget", "music", "heroPhoto", "featurePhoto", "stickerPhoto"]) {
      assert.equal(localized[key], original[key], `${slug}.${key}`);
    }
    for (const key of ["calendar", "videos", "motionVideos", "backgrounds", "videoPosters", "gateArtwork"]) {
      assert.equal(localized[key], original[key], `${slug}.${key}`);
    }
    assert.equal(localized.location.mapsUrl, original.location.mapsUrl);
    assert.equal(localized.location.contact, original.location.contact);
    assert.equal(localized.dateParts.day, original.dateParts.day);
    assert.equal(localized.dateParts.year, original.dateParts.year);
    assert.notEqual(localized.intro[0], original.intro[0]);
    assert.equal(localized.intro.length, original.intro.length);
    assert.deepEqual(localized.schedule?.map((item) => item.time), original.schedule?.map((item) => item.time));
    assert.equal(localized.arrival?.time, original.arrival?.time);
  }
});

test("removed guest features have no routes, components, translation keys or dependencies", async () => {
  for (const file of ["src/app/api/rsvp/route.js", "src/app/api/rsvp/health/route.js", "src/components/RSVPForm.jsx", "src/components/GuestExtras.jsx", "src/data/features.js", "src/lib/validation.js"]) {
    await assert.rejects(fs.access(path.join(root, file)), { code: "ENOENT" });
  }
  for (const strings of Object.values(translations)) {
    assert.ok(!Object.keys(strings).some(key => /rsvp|seating|upload|extras/i.test(key)));
    for (const copy of Object.values(strings.invitationCopy)) assert.ok(!Object.keys(copy).some(key => /rsvp/i.test(key)));
  }
  const { dependencies } = JSON.parse(await read("package.json"));
  assert.equal(dependencies["canvas-confetti"], undefined);
  assert.equal(dependencies["framer-motion"], undefined);
});

test("guest personalization limits length, preserves Sinhala and removes controls, markup brackets and bidi marks", () => {
  assert.equal(sanitizeGuestName(undefined), "");
  assert.equal(sanitizeGuestName({ name: "Guest" }), "");
  assert.equal(sanitizeGuestName("---"), "");
  assert.equal(sanitizeGuestName(["  Guest   Name  ", "Ignored"]), "Guest Name");
  assert.equal(sanitizeGuestName("\u0000 <Guest>\n Name \u202e"), "Guest Name");
  assert.equal(sanitizeGuestName("නිමාලි පෙරේරා"), "නිමාලි පෙරේරා");
  assert.equal(sanitizeGuestName("A".repeat(80)).length, 40);
});

test("calendar actions retain the Colombo ceremony time and exclusive homecoming all-day end date", () => {
  const wedding = getInvitation("wedding").calendar;
  const homecoming = getInvitation("homecoming").calendar;
  const weddingIcs = createCalendarFile(wedding);
  assert.ok(weddingIcs.includes("DTSTART;TZID=Asia/Colombo:20261126T091600\r\n"));
  assert.ok(weddingIcs.includes("DTEND;TZID=Asia/Colombo:20261126T160800\r\n"));
  assert.ok(weddingIcs.includes("LOCATION:Hemandra Grand Hotel"));
  const homecomingIcs = createCalendarFile(homecoming);
  assert.ok(homecomingIcs.includes("DTSTART;VALUE=DATE:20261130\r\n"));
  assert.ok(homecomingIcs.includes("DTEND;VALUE=DATE:20261201\r\n"));
  assert.ok(homecomingIcs.includes("LOCATION:Senwin Mandeer\\, Thalgaswala"));
  const weddingUrl = new URL(createGoogleCalendarUrl(wedding));
  assert.equal(weddingUrl.origin, "https://calendar.google.com");
  assert.equal(weddingUrl.searchParams.get("dates"), "20261126T091600/20261126T160800");
  assert.equal(weddingUrl.searchParams.get("ctz"), "Asia/Colombo");
  const homecomingUrl = new URL(createGoogleCalendarUrl(homecoming));
  assert.equal(homecomingUrl.searchParams.get("dates"), "20261130/20261201");
  assert.equal(homecomingUrl.searchParams.has("ctz"), false);
  assert.equal(homecomingUrl.searchParams.get("location"), "Senwin Mandeer, Thalgaswala");
});

const { invitationThemes } = await import(moduleUrl(await read("src/data/themes.js")));
const stylesheet = await read("src/app/globals.css");

test("background derivatives are small, silent, portrait, and backed by archived sources", async () => {
  const clips = JSON.parse(await read("src/data/background-videos.json"));
  for (const sections of Object.values(clips)) {
    assert.deepEqual(Object.keys(sections).sort(), ["closing", "cover", "hero"]);
    for (const clip of Object.values(sections)) {
      assert.ok(clip.bytes <= 1_500_000);
      assert.equal(clip.hasAudio, false);
      assert.equal(clip.width, 540);
      assert.equal(clip.height, 960);
      assert.equal(clip.duration, 10);
      assert.equal(clip.fps, 24);
      assert.equal(clip.fastStart, true);
      assert.equal((await fs.stat(path.join(root, "public", clip.src))).size, clip.bytes);
      assert.equal((await fs.stat(path.join(root, clip.sourcePath))).size, clip.originalBytes);
      assert.ok(!clip.sourcePath.startsWith("public/"));
      assert.ok(clip.webm.bytes < clip.bytes);
      assert.equal((await fs.stat(path.join(root, "public", clip.webm.src))).size, clip.webm.bytes);
    }
  }
  assert.equal(clips.homecoming.cover.src, clips.homecoming.hero.src);
});
test("theme text and gold surfaces meet WCAG AA contrast", () => {
  const luminance = (color) => {
    const channels = color.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255).map((value) => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const ratio = (first, second) => {
    const a = luminance(first), b = luminance(second);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  };
  for (const [name, theme] of Object.entries(invitationThemes)) {
    for (const key of ["--ink", "--muted", "--accent"]) {
      for (const surface of ["--bg", "--surface"]) assert.ok(ratio(theme[key], theme[surface]) >= 4.5, name + " " + key + " on " + surface);
    }
  }
  const goldInk = stylesheet.match(/--gold-ink:\s*(#[a-f\d]{6})/i)[1];
  const goldStops = stylesheet.match(/--gold-gradient: ([^;]+)/)[1].match(/#[a-f\d]{6}/gi);
  const footerMuted = stylesheet.match(/\.closing-section\s*\{([^}]+)\}/)[1].match(/--muted:\s*(#[a-f\d]{6})/i)[1];
  for (const stop of goldStops) {
    assert.ok(ratio(goldInk, stop) >= 4.5, "Gold action text");
    assert.ok(ratio(footerMuted, stop) >= 4.5, "Gold footer text");
  }
  const blend = (rgb, backdrop, alpha) => "#" + rgb.split(",").map(channel => Math.round(Number(channel) * alpha + backdrop * (1 - alpha)).toString(16).padStart(2, "0")).join("");
  const minAlpha = Number(stylesheet.match(/--video-scrim-min:\s*([.\d]+)/)[1]);
  for (const theme of Object.values(invitationThemes)) {
    for (const backdrop of [0, 255]) {
      for (const key of ["--ink", "--muted", "--accent"]) assert.ok(ratio(theme[key], blend(theme["--video-scrim-rgb"], backdrop, minAlpha)) >= 4.5, key + " over brightest/darkest video frame");
    }
  }
  const footerStops = stylesheet.match(/--closing-gradient: ([^;]+)/)[1].match(/#[a-f\d]{6}/gi);
  for (const stop of footerStops) {
    const rgb = stop.slice(1).match(/.{2}/g).map(channel => parseInt(channel, 16)).join(",");
    for (const backdrop of [0, 255]) assert.ok(ratio(footerMuted, blend(rgb, backdrop, .96)) >= 4.5, "Footer text over video");
  }
});
