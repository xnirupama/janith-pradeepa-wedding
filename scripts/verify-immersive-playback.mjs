import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
const pw = await import(process.env.INVITATION_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href : "playwright");
const base = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3102";
const results = [];
for (const engine of (process.env.QA_ENGINES || "chromium,webkit").split(",")) {
  const browser = await pw[engine].launch();
  try {
    for (const event of ["wedding", "homecoming"]) for (const mode of (process.env.QA_PROFILES || "normal,blocked-once,blocked-always,network-failure,stalled").split(",")) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
      await context.addInitScript(mode => {
        Object.defineProperty(navigator, "hardwareConcurrency", { value: 8 });
        Object.defineProperty(navigator, "deviceMemory", { value: 8 });
        Object.defineProperty(navigator, "connection", { value: { saveData: false, effectiveType: "4g", downlink: 10 } });
        window.pageVideoAudit = { calls: 0, events: [] };
        const native = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function () {
          if (this.dataset.priority === "page") {
            const audit = window.pageVideoAudit;
            audit.calls++;
            if (!this.dataset.audited) {
              this.dataset.audited = "true";
              ["loadeddata", "playing", "pause"].forEach(event => this.addEventListener(event, () => audit.events.push(event)));
            }
            if (mode === "blocked-always" || (mode === "blocked-once" && audit.calls === 1)) return Promise.reject(new DOMException("Autoplay blocked fixture", "NotAllowedError"));
          }
          return native.call(this);
        };
      }, mode);
      await context.route("https://maps.google.com/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><p>Map fixture</p>" }));
      if (mode === "network-failure" && engine !== "webkit") await context.route(/immersive\.[a-f0-9]+\.mp4/, route => route.abort());
      const page = await context.newPage();
      try {
        await page.goto(`${base}/${event}`, { waitUntil: "domcontentloaded" });
        await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
        assert.equal(await page.locator(".page-video").count(), 0, "Ambient media mounted before opening");
        await page.locator(".gate-button").click();
        await page.waitForFunction(() => document.querySelector(".opening-film video").currentTime > .1);
        assert.equal(await page.locator(".page-video").count(), 0, "Ambient media competes with opening film");
        await page.locator(".opening-film-skip").click();
        await page.locator(".opening-film").waitFor({ state: "hidden" });
        await page.locator(".page-video").waitFor();
        const video = page.locator(".page-video video");
        // WebKit's native media requests can bypass Playwright routing. A real
        // missing URL exercises its network error through the media element.
        if (mode === "network-failure" && engine === "webkit") {
          await page.waitForFunction(() => document.querySelector(".page-video video source"));
          await video.evaluate(v => { v.src = "/__qa_missing_background.mp4"; v.load(); });
        }
        assert.ok(await video.evaluate(v => v.muted && v.loop && v.playsInline && !v.controls && v.hasAttribute("disablePictureInPicture") && v.getAttribute("aria-hidden") === "true" && v.preload === "metadata"));
        const failure = ["blocked-once", "blocked-always", "network-failure"].includes(mode);
        await page.waitForFunction(failure => document.querySelector(".page-video").dataset.videoState === (failure ? "fallback" : "playing"), failure);
        if (failure) {
          await page.waitForFunction(() => getComputedStyle(document.querySelector(".page-video video")).opacity === "0");
          assert.equal(await video.evaluate(v => getComputedStyle(v).opacity), "0");
          assert.ok(await page.locator(".page-video .video-poster").evaluate(img => img.complete && img.naturalWidth > 0));
        }
        if (mode === "blocked-once") {
          await page.locator(".hero-content").tap({ position: { x: 5, y: 5 } });
          await page.waitForFunction(() => document.querySelector(".page-video").dataset.videoState === "playing");
        }
        if (mode === "blocked-always") {
          await page.locator(".hero-content").tap({ position: { x: 5, y: 5 } });
          await page.waitForTimeout(300);
          const calls = await page.evaluate(() => window.pageVideoAudit.calls);
          assert.equal(calls, 2);
          await page.locator(".hero-content").tap({ position: { x: 5, y: 5 } });
          await page.waitForTimeout(300);
          assert.equal(await page.evaluate(() => window.pageVideoAudit.calls), calls, "More than one gesture retry");
        }
        if (mode === "stalled") {
          await video.evaluate(v => { Object.defineProperty(v, "currentTime", { configurable: true, get: () => 0 }); v.dispatchEvent(new Event("stalled")); });
          await page.waitForTimeout(4500);
          assert.notEqual(await page.locator(".page-video").getAttribute("data-video-state"), "fallback", "Stall fallback fired before six seconds");
          await page.waitForFunction(() => document.querySelector(".page-video").dataset.videoState === "fallback");
        }
        if (mode === "normal") {
          const audit = await page.evaluate(() => window.pageVideoAudit);
          assert.ok(audit.events.includes("playing"));
          assert.equal(await page.locator('video[data-background-video]').evaluateAll(videos => videos.filter(v => !v.paused).length), 1);
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => document.querySelector(".page-video video").paused);
          await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
          await page.waitForFunction(() => document.querySelector(".page-video").dataset.videoState === "playing");
        }
        results.push({ engine, event, mode, passed: true, ...await page.evaluate(() => window.pageVideoAudit) });
        console.log("PASS", engine, event, mode);
      } finally { await context.close(); }
    }
  } finally { await browser.close(); }
}
await fs.mkdir("artifacts/qa/immersive-v2-playback", { recursive: true });
await fs.writeFile("artifacts/qa/immersive-v2-playback/results.json", JSON.stringify(results, null, 2) + "\n");
