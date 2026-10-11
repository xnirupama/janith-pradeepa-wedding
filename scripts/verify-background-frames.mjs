import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { chromium } = await import(process.env.INVITATION_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href : "playwright");
const browser = await chromium.launch();
const results = [];
try {
  for (const event of ["wedding", "homecoming"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "deviceMemory", { value: 8 });
      Object.defineProperty(navigator, "hardwareConcurrency", { value: 8 });
      Object.defineProperty(navigator, "connection", { value: { saveData: false, effectiveType: "4g", downlink: 10 } });
    });
    await context.route("https://maps.google.com/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html><p>Map preview fixture</p>" }));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.goto(`${process.env.INVITATION_TEST_URL || "http://127.0.0.1:3102"}/${event}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
    await page.locator(".gate-button").click();
    await page.waitForFunction(() => document.querySelector(".opening-film video").currentTime > .2);
    await page.locator(".opening-film-skip").click();
    await page.locator(".opening-film").waitFor({ state: "hidden" });
    await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
    for (const section of ["hero-section", "schedule-section", "countdown-section", "closing-section"]) {
      await page.locator("." + section).evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
      await page.waitForTimeout(1200);
      const sample = await page.evaluate(async () => {
        const frames = [], started = performance.now();
        let last;
        await new Promise(resolve => {
          const tick = time => {
            if (last !== undefined) frames.push(time - last);
            last = time;
            if (time - started >= 6000) resolve(); else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        frames.sort((a, b) => a - b);
        return { samples: frames.length, medianMs: frames[Math.floor(frames.length * .5)], p95Ms: frames[Math.floor(frames.length * .95)], over34ms: frames.filter(ms => ms > 34).length, runningAnimations: document.getAnimations().filter(a => a.playState === "running").length };
      });
      results.push({ event, section, cpuThrottle: 4, ...sample });
      console.log(JSON.stringify(results.at(-1)));
    }
    await context.close();
  }
} finally { await browser.close(); }
await fs.mkdir("artifacts/qa/background-frames", { recursive: true });
await fs.writeFile("artifacts/qa/background-frames/results.json", JSON.stringify(results, null, 2) + "\n");
