import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const modulePath = process.env.INVITATION_PLAYWRIGHT_MODULE;
const engines = await import(modulePath ? pathToFileURL(modulePath).href : "playwright");
const baseURL = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3101";
const output = path.resolve("artifacts/qa/motion");
await fs.mkdir(output, { recursive: true });
const reports = [];

async function visibility(page, hidden) {
  await page.evaluate(value => {
    Object.defineProperty(document, "visibilityState", { configurable: true, get: () => value ? "hidden" : "visible" });
    document.dispatchEvent(new Event("visibilitychange"));
  }, hidden);
}
async function scrollTo(page, id) {
  await page.evaluate(section => document.getElementById(section).scrollIntoView({ behavior: "instant", block: "start" }), id);
  await page.waitForTimeout(400);
}
for (const name of (process.env.QA_ENGINES || "chromium,webkit").split(",")) {
  const browser = await engines[name].launch({ headless: true });
  try {
    for (const event of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) {
      for (const profile of (process.env.QA_PROFILES || "normal,reduced-motion,save-data,slow,autoplay-blocked").split(",")) {
        const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: profile === "reduced-motion" ? "reduce" : "no-preference" });
        await context.addInitScript(mode => {
          if (["save-data", "slow"].includes(mode)) Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: mode === "save-data", effectiveType: mode === "slow" ? "3g" : "4g", downlink: mode === "slow" ? .7 : 10 } });
          if (mode === "autoplay-blocked") {
            const play = HTMLMediaElement.prototype.play;
            HTMLMediaElement.prototype.play = function () { return this.hasAttribute("data-background-video") ? Promise.reject(new DOMException("Autoplay blocked", "NotAllowedError")) : play.call(this); };
          }
          window.mediaAudit = { maxVideos: 0, ungesturedAudio: false };
          document.addEventListener("play", event => {
            const videos = [...document.querySelectorAll("video")].filter(video => !video.paused);
            window.mediaAudit.maxVideos = Math.max(window.mediaAudit.maxVideos, videos.length);
            if (event.target.tagName === "AUDIO" && document.querySelector(".invitation-gate")) window.mediaAudit.ungesturedAudio = true;
          }, true);
        }, profile);
        const page = await context.newPage();
        const errors = [], requests = [];
        page.on("pageerror", error => errors.push(error.message));
        page.on("request", request => { if (/\.(mp4|webm|mp3)(\?|$)/.test(request.url())) requests.push(request.url()); });
        try {
          await page.goto(baseURL + "/" + event, { waitUntil: "domcontentloaded" });
          await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
          await page.evaluate(() => document.fonts.ready);
          assert.equal(await page.locator("iframe").count(), 0);
          assert.equal(await page.locator("#invitation-music").evaluate(audio => audio.paused), true);
          assert.equal(await page.locator(".opening-film video").getAttribute("src"), null);
          const cover = page.locator(".cover-backdrop video");
          if (profile === "normal") {
            await page.waitForFunction(() => { const video = document.querySelector(".cover-backdrop video"); return video && !video.paused && video.readyState >= 2 && video.classList.contains("is-playing"); });
            const attributes = await cover.evaluate(video => ({ src: video.currentSrc, poster: video.poster, muted: video.muted, inline: video.playsInline, loop: video.loop, autoplay: video.autoplay, preload: video.preload, pip: video.hasAttribute("disablepictureinpicture") }));
            assert.ok(attributes.src.includes("/optimized/"));
            assert.ok(attributes.poster.endsWith(".webp"));
            for (const key of ["muted", "inline", "loop", "autoplay", "pip"]) assert.equal(attributes[key], true, key);
            assert.equal(attributes.preload, "metadata");
            await page.waitForFunction(() => document.querySelector('.gate-mandalas .rotation-layer[data-motion-running="true"]'));
            const first = await page.locator(".gate-mandalas .rotation-layer").first().evaluate(layer => getComputedStyle(layer).transform);
            await page.waitForTimeout(250);
            assert.notEqual(await page.locator(".gate-mandalas .rotation-layer").first().evaluate(layer => getComputedStyle(layer).transform), first);
            await visibility(page, true);
            await page.waitForFunction(() => [...document.querySelectorAll("video")].every(video => video.paused) && !document.querySelector('.rotation-layer[data-motion-running="true"]'));
            await visibility(page, false);
            await page.waitForFunction(() => !document.querySelector(".cover-backdrop video").paused);
          } else if (profile === "autoplay-blocked") {
            await page.waitForTimeout(500);
            assert.equal(await cover.evaluate(video => video.paused && !video.classList.contains("is-playing")), true);
          } else {
            assert.equal(requests.length, 0, profile + " downloaded a video before opening");
            assert.equal(await cover.evaluate(video => video.querySelector("source[src]") === null), true);
            if (profile === "reduced-motion") assert.equal(await page.locator(".rotation-layer").first().evaluate(layer => getComputedStyle(layer).animationName), "none");
          }
          await page.screenshot({ path: path.join(output, name + "-" + event + "-" + profile + "-cover.png") });
          await page.locator(".gate-button").click();
          if (["normal", "autoplay-blocked"].includes(profile)) {
            await page.locator(".opening-film[open]").waitFor();
            await page.waitForFunction(() => { const video = document.querySelector(".opening-film video"); return video && !video.paused && video.readyState >= 2; });
            assert.equal(await page.locator("[data-background-video]").evaluateAll(videos => videos.every(video => video.paused)), true);
            await page.locator(".opening-film-skip").click();
          }
          await page.locator("#top").waitFor();
          assert.equal(await page.locator("form,#rsvp").count(), 0);
          assert.equal(await page.locator('.section-navigator a[href="#contact"]').count(), 1);
          assert.equal(await page.locator(".hero-section .video-backdrop").count(), 1);
          assert.equal(await page.locator("footer .video-backdrop").count(), 1);
          assert.equal(await page.locator(".schedule-section video,.countdown-section video,.gallery-section video,.location-section video").count(), 0);
          if (profile === "normal") {
            await page.waitForFunction(() => { const video = document.querySelector(".hero-backdrop video"); return video && !video.paused && video.readyState >= 2; });
            await page.waitForFunction(() => !document.getElementById("invitation-music").paused);
            await visibility(page, true);
            await page.waitForFunction(() => [...document.querySelectorAll("video,audio")].every(media => media.paused));
            await visibility(page, false);
            await page.waitForFunction(() => !document.getElementById("invitation-music").paused && !document.querySelector(".hero-backdrop video").paused);
            await scrollTo(page, "event-details");
            await page.waitForFunction(() => [...document.querySelectorAll("[data-background-video]")].every(video => video.paused));
            assert.equal(await page.locator(".footer-backdrop source[src]").count(), 0, "Footer video loaded early");
            const directions = await page.locator(".arch-card-medallion .rotation-layer").evaluateAll(layers => layers.map(layer => getComputedStyle(layer).animationDirection));
            assert.deepEqual(directions, event === "wedding" ? ["normal", "reverse", "normal"] : ["normal"]);
          }
          await scrollTo(page, "contact");
          if (profile === "normal") {
            await page.waitForFunction(() => { const video = document.querySelector(".footer-backdrop video"); return video && !video.paused && video.readyState >= 2; });
            assert.equal(await page.locator(".hero-backdrop video").evaluate(video => video.paused), true);
            await page.locator(".music-control").click();
            await page.waitForFunction(() => document.getElementById("invitation-music").paused);
            await visibility(page, true); await visibility(page, false);
            await page.waitForTimeout(200);
            assert.equal(await page.locator("#invitation-music").evaluate(audio => audio.paused), true, "User-paused music resumed");
          } else {
            assert.equal(await page.locator("[data-background-video]").evaluateAll(videos => videos.every(video => video.paused && !video.classList.contains("is-playing"))), true);
            if (profile !== "autoplay-blocked") assert.ok(requests.every(url => url.endsWith(".mp3")), "Poster-only profile fetched a video");
          }
          await page.screenshot({ path: path.join(output, name + "-" + event + "-" + profile + "-footer.png") });
          const audit = await page.evaluate(() => window.mediaAudit);
          assert.ok(audit.maxVideos <= 2, "More than two videos played together");
          assert.equal(audit.ungesturedAudio, false);
          assert.deepEqual(errors, []);
          reports.push({ engine: name, event, profile, passed: true, maxPlayingVideos: audit.maxVideos, ungesturedAudio: false, errors });
          console.log("PASS " + name + " " + event + " " + profile);
        } catch (error) {
          console.log(JSON.stringify(await page.evaluate(() => ({ media: [...document.querySelectorAll("video,audio")].map(media => ({ kind: media.tagName, className: media.className, paused: media.paused, ready: media.readyState, src: media.currentSrc })), visibility: document.visibilityState, audit: window.mediaAudit }))));
          await page.screenshot({ path: path.join(output, name + "-" + event + "-" + profile + "-failure.png") });
          throw error;
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
}
await fs.writeFile(path.join(output, "results.json"), JSON.stringify({ reports, profiles: reports.length }, null, 2));
console.log("PASS " + reports.length + " motion/media scenarios.");
