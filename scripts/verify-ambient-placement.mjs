import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pw = await import(process.env.INVITATION_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href : "playwright");
const base = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3101";
const output = process.env.QA_OUTPUT || "artifacts/qa/ambient-placement";
await fs.mkdir(output, { recursive: true });
const results = [];
const sections = [".hero-section", ".invitation-message", ".schedule-section", ".countdown-section", ".photo-feature", ".gallery-section", ".celebration-section", ".location-section", ".closing-section"];
const profiles = (process.env.QA_PROFILES || "normal,disabled,low-end,slow,reduced-motion,blocked,stalled,hidden").split(",");
for (const engine of (process.env.QA_ENGINES || "chromium,webkit").split(",")) {
  const browser = await pw[engine].launch({ headless: true });
  try {
    for (const event of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) for (const profile of profiles) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: profile === "reduced-motion" ? "reduce" : "no-preference" });
      await context.addInitScript(mode => {
        Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: mode === "low-end" ? 2 : 8 });
        Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: mode === "low-end" ? 2 : 8 });
        Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: mode === "disabled", effectiveType: mode === "slow" ? "3g" : "4g", downlink: mode === "slow" ? .5 : 10 } });
        const play = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
          if (mode === "blocked" && ["hero", "ambient"].includes(this.dataset.priority)) return Promise.reject(new DOMException("Autoplay fixture", "NotAllowedError"));
          return play.call(this);
        };
        window.ambientAudit = { maxPlaying: 0 };
        document.addEventListener("play", () => { window.ambientAudit.maxPlaying = Math.max(window.ambientAudit.maxPlaying, [...document.querySelectorAll("video")].filter(v => !v.paused).length); }, true);
      }, profile);
      await context.route("https://maps.google.com/**", r => r.fulfill({ contentType: "text/html", body: "<!doctype html><p>Map fixture</p>" }));
      const page = await context.newPage(), errors = [], warnings = [], requests = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", msg => { if (["error", "warning"].includes(msg.type())) warnings.push(msg.text()); });
      page.on("request", req => { if (/\.(mp4|webm)(\?|$)/.test(req.url())) requests.push(req.url()); });
      const screen = name => page.locator(name).screenshot({ path: path.join(output, `${engine}-${event}-${profile}-${name.replace(/^[.#]/, "")}.png`) });
      try {
        await page.goto(`${base}/${event}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
        await page.evaluate(() => document.fonts.ready);
        if (["normal", "disabled"].includes(profile)) await screen(".invitation-gate");
        assert.equal(requests.some(url => /seamless|opening-couple/.test(url)), false, "Content and opening clips loaded before Open");
        await page.locator(".gate-button").click();
        await page.waitForFunction(() => document.querySelector('.opening-film video').currentTime > .2);
        if (["normal", "disabled"].includes(profile)) await screen(".opening-film");
        await page.locator(".opening-film-skip").click();
        await page.locator(".opening-film").waitFor({ state: "hidden" });
        await page.locator(".section-navigator").waitFor();
        const hero = page.locator(".hero-backdrop");
        const posterOnly = ["disabled", "low-end", "slow", "reduced-motion"].includes(profile);
        if (posterOnly) {
          await page.waitForFunction(() => document.querySelector(".hero-backdrop").dataset.videoState === "fallback");
          assert.equal(requests.some(url => /seamless/.test(url)), false);
        } else if (profile === "blocked") await page.waitForFunction(() => document.querySelector(".hero-backdrop").dataset.videoState === "fallback");
        else await page.waitForFunction(() => document.querySelector(".hero-backdrop video").currentTime > .2 && document.querySelector(".hero-backdrop").dataset.videoState === "playing");
        if (profile === "stalled") {
          await hero.locator("video").evaluate(v => { const frozen = v.currentTime; Object.defineProperty(v, "currentTime", { configurable: true, get: () => frozen }); v.dispatchEvent(new Event("waiting")); });
          await page.waitForFunction(() => document.querySelector(".hero-backdrop").dataset.videoState === "fallback", null, { timeout: 6000 });
          await screen(".hero-section");
        }
        if (profile === "hidden") {
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => [...document.querySelectorAll("video")].every(v => v.paused));
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => document.querySelector(".hero-backdrop").dataset.videoState === "playing");
        }
        assert.equal(await page.locator(".ambient-backdrop").count(), event === "wedding" ? 2 : 1);
        if (event === "wedding") assert.equal(await page.locator(".celebration-backdrop video").getAttribute("preload"), "none");
        else assert.equal(await page.locator(".celebration-backdrop video").count(), 0);
        assert.equal(await hero.locator("video").getAttribute("preload"), "auto");
        for (const selector of [".invitation-message", ".schedule-section", ".countdown-section", ".photo-feature", ".gallery-section", ".location-section", ".closing-section"]) assert.equal(await page.locator(selector + " video").count(), 0);
        assert.equal(await page.locator("form,#rsvp,[href='#rsvp']").count(), 0);
        assert.equal(await page.locator(".section-navigator a").nth(4).getAttribute("href"), "#contact");
        for (const selector of sections) {
          // Reveal every part of a tall section before taking its full-height
          // screenshot, just as a guest does while scrolling through it.
          if (["normal", "disabled"].includes(profile)) {
            for (const reveal of await page.locator(selector + " .section-reveal").all()) {
              await reveal.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
              await page.waitForTimeout(150);
            }
          }
          await page.locator(selector).evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
          await page.waitForTimeout(750);
          if (selector === ".celebration-section" && event === "wedding") {
            if (posterOnly || profile === "blocked") await page.waitForFunction(() => document.querySelector(".celebration-backdrop").dataset.videoState === "fallback");
            else await page.waitForFunction(() => document.querySelector(".celebration-backdrop").dataset.videoState === "playing");
          }
          if (["normal", "disabled"].includes(profile)) await screen(selector);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Horizontal overflow");
        }
        await page.waitForFunction(() => !document.querySelector(".hero-backdrop video").querySelector("source"));
        const styles = await page.locator(".ambient-backdrop").evaluateAll(nodes => nodes.map(node => ({ opacity: getComputedStyle(node).getPropertyValue("--ambient-opacity").trim(), blend: getComputedStyle(node.querySelector("video")).mixBlendMode, mask: getComputedStyle(node).maskImage, controls: node.querySelector("video").controls, poster: node.querySelector("img").complete, filter: getComputedStyle(node.querySelector("video")).filter })));
        assert.ok(styles.every(style => style.poster && !style.controls && style.mask.includes("linear-gradient") && style.filter.includes("saturate")));
        const audit = await page.evaluate(() => window.ambientAudit);
        assert.ok(audit.maxPlaying <= 2, "More than two videos played");
        if (posterOnly) assert.equal(requests.some(url => /seamless/.test(url)), false, "Policy loaded an ambient clip during scroll");
        assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
        results.push({ engine, event, profile, passed: true, maxPlaying: audit.maxPlaying, styles, errors, warnings });
        console.log("PASS", engine, event, profile);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
assert.ok(results.length);
await fs.writeFile(path.join(output, "results.json"), JSON.stringify(results, null, 2) + "\n");
