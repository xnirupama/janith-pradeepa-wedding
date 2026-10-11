import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { captureSection } from "./qa-section-capture.mjs";

const pw = await import(process.env.INVITATION_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href : "playwright");
const base = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3102";
const output = process.env.QA_OUTPUT || "artifacts/qa/backgrounds";
const profiles = (process.env.QA_PROFILES || "normal,reduced-motion,save-data,low-end,slow").split(",");
const sections = (process.env.QA_SECTIONS || "hero-section,invitation-message,schedule-section,countdown-section,photo-feature,gallery-section,celebration-section,location-section,closing-section").split(",");
await fs.mkdir(output, { recursive: true });
const results = [];
for (const engine of (process.env.QA_ENGINES || "chromium,webkit").split(",")) {
  const browser = await pw[engine].launch();
  try {
    for (const event of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) for (const profile of profiles) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: profile === "reduced-motion" ? "reduce" : "no-preference" });
      await context.addInitScript(mode => {
        Object.defineProperty(navigator, "deviceMemory", { configurable: true, value: mode === "low-end" ? 2 : 8 });
        Object.defineProperty(navigator, "hardwareConcurrency", { configurable: true, value: mode === "low-end" ? 2 : 8 });
        Object.defineProperty(navigator, "connection", { configurable: true, value: { saveData: mode === "save-data", effectiveType: mode === "slow" ? "3g" : "4g", downlink: mode === "slow" ? .5 : 10 } });
      }, profile);
      await context.route("https://maps.google.com/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><p>Map preview fixture</p>" }));
      const page = await context.newPage(), errors = [], warnings = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("console", message => { if (["error", "warning"].includes(message.type())) warnings.push(message.text()); });
      try {
        await page.goto(`${base}/${event}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
        assert.equal(await page.locator(".page-background").getAttribute("data-background-active"), "false");
        if (["normal", "reduced-motion"].includes(profile)) await page.locator(".invitation-gate").screenshot({ path: `${output}/${engine}-${event}-${profile}-gate.png` });
        await page.locator(".gate-button").click();
        await page.waitForFunction(() => document.querySelector(".opening-film video").currentTime > .2);
        assert.equal(await page.locator(".page-background").getAttribute("data-background-active"), "false");
        await page.locator(".opening-film-skip").click();
        await page.locator(".opening-film").waitFor({ state: "hidden" });
        await page.locator(".section-navigator").waitFor();
        // Full-section review images exclude fixed controls that would otherwise
        // be repeated midway through a long section by the screenshot renderer.
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; } .section-navigator, .music-control, .language-toggle--floating { visibility: hidden !important; }' });
        assert.equal(await page.locator(".section-atmosphere").count(), 9);
        assert.equal(await page.locator(".background-music-glow").count(), 0);
        assert.equal(await page.locator(".background-bokeh").count(), 3);
        assert.equal(await page.locator(".hero-light-sweep").count(), 1);
        assert.equal(await page.locator(".location-card .venue-photos img").count(), 2);
        const policyOff = profile !== "normal";
        await page.waitForFunction(off => document.querySelector(".page-background").dataset.backgroundActive === String(!off), policyOff);
        if (policyOff) {
          assert.equal(await page.locator(".background-air").evaluate(el => getComputedStyle(el).display), "none");
          assert.equal(await page.locator('.rotation-layer[data-motion-running="true"]').count(), 0);
        } else {
          assert.equal(await page.locator(".gold-speck").evaluateAll(nodes => nodes.filter(node => getComputedStyle(node).display !== "none").length), 16);
          await page.waitForFunction(() => document.querySelector(".hero-light-sweep").closest(".section-atmosphere").dataset.backgroundRunning === "true");
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => document.querySelector(".page-background").dataset.backgroundMotion === "paused");
          assert.equal(await page.locator(".background-bokeh").first().evaluate(el => getComputedStyle(el).animationPlayState), "paused");
          assert.equal(await page.locator('.rotation-layer[data-motion-running="true"]').count(), 0);
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => document.querySelector(".page-background").dataset.backgroundMotion === "running");
        }
        const effectCounts = [];
        for (const name of sections) {
          const section = page.locator("." + name);
          for (const reveal of await section.locator(".section-reveal").all()) {
            await reveal.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
            await page.waitForTimeout(120);
          }
          await section.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
          for (const picture of await section.locator("img:not(.video-poster)").all()) {
            await picture.evaluate(async image => {
              image.loading = "eager";
              await image.decode();
            });
          }
          await page.waitForTimeout(750);
          if (["normal", "reduced-motion"].includes(profile)) {
            await captureSection(page, section, `${output}/${engine}-${event}-${profile}-${name}.png`);
            await section.evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY, behavior: "instant" }));
            await page.waitForTimeout(150);
          }
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + " overflows");
          const counts = await page.evaluate(selector => {
            const section = document.querySelector(selector);
            const animations = document.getAnimations().filter(animation => animation.playState === "running" && animation.effect?.target instanceof Element && getComputedStyle(animation.effect.target).display !== "none");
            return { section: selector, running: animations.length, backgroundRunning: animations.filter(a => a.effect.target.closest(".page-background, .section-atmosphere")).length, sectionRunning: animations.filter(a => section.contains(a.effect.target)).length };
          }, "." + name);
          effectCounts.push(counts);
          if (policyOff) assert.equal(counts.backgroundRunning, 0);
        }
        if (!policyOff) assert.equal(await page.locator(".hero-light-sweep").evaluate(el => getComputedStyle(el).animationPlayState), "paused", "Offscreen sweep did not pause");
        const layers = await page.locator(".page-background, .section-tone, .section-halo, .section-watermarks").evaluateAll(nodes => nodes.map(node => ({ pointer: getComputedStyle(node).pointerEvents, filter: getComputedStyle(node).filter })));
        assert.ok(layers.every(layer => layer.pointer === "none" && layer.filter === "none"));
        assert.equal(await page.locator(".page-background button, .section-atmosphere button").count(), 0);
        assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
        results.push({ engine, event, profile, passed: true, effectCounts, errors, warnings });
        console.log("PASS", engine, event, profile);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
assert.ok(results.length);
await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + "\n");
