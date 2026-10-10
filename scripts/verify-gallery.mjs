import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const modulePath = process.env.INVITATION_PLAYWRIGHT_MODULE || process.env.PLAYWRIGHT_MODULE;
const playwright = modulePath
  ? await import(pathToFileURL(modulePath).href)
  : await import("playwright");
const baseURL = process.env.INVITATION_TEST_URL || process.env.QA_BASE_URL || "http://127.0.0.1:3101";
const output = path.resolve("artifacts/qa/gallery");
await mkdir(output, { recursive: true });
const language = process.env.QA_LANGUAGE || "en";
const report = { baseURL, language, testedAt: new Date().toISOString(), results: [] };

async function imageView(page) {
  return page.locator(".lightbox-image").evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return { scale: matrix.a, x: matrix.e, y: matrix.f };
  });
}
async function waitForScale(page, scale) {
  await page.waitForFunction((expected) => {
    const element = document.querySelector(".lightbox-image");
    return element && Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).a - expected) < 0.01;
  }, scale);
}
async function activeNumber(page) {
  return Number((await page.locator(".lightbox-count").innerText()).match(/\d+/)[0]);
}
async function touchSequence(session, points) {
  const touches = (coordinates) => coordinates.map(([id, x, y]) => ({ id, x, y, radiusX: 4, radiusY: 4, force: 1 }));
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: touches(points[0]) });
  for (const coordinates of points.slice(1)) {
    await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: touches(coordinates) });
  }
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

for (const engine of (process.env.QA_ENGINES || "chromium,webkit").split(",")) {
  let browser;
  try {
    browser = await playwright[engine].launch({ headless: true });
    for (const route of (process.env.QA_ROUTES || "wedding,homecoming").split(",")) {
      const result = { engine, route, viewport: { width: 390, height: 844 }, checks: [], errors: [], passed: false };
      report.results.push(result);
      const context = await browser.newContext({ viewport: result.viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
      await context.addCookies([{name:"invitation-language",value:language,url:baseURL}]);
      await context.addInitScript(lang=>localStorage.setItem("invitation-language",lang),language);
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
      page.on("pageerror", (error) => result.errors.push(error.message));
      try {
        await page.goto(`${baseURL}/${route}?guest=Gallery%20QA`, { waitUntil: "domcontentloaded", timeout: 60000 });
        await page.waitForFunction(() => {
          const button = document.querySelector(".gate-button");
          return button && !button.disabled;
        });
        await page.evaluate(() => document.fonts.ready);
        await page.locator(".gate-button").click();
        await page.locator(".gallery-photo").first().waitFor();
        const count = await page.locator(".gallery-photo").count();
        assert.equal(count, route === "wedding" ? 2 : 1, "Only distinct supplied couple portraits appear");
        const trigger = page.locator(".gallery-photo").first();
        await trigger.scrollIntoViewIfNeeded();
        const originalScroll = await page.evaluate(() => scrollY);
        await trigger.click();
        await page.locator("dialog.lightbox[open]").waitFor();
        await page.waitForFunction(() => {
          const image = document.querySelector(".lightbox-image img");
          return image?.complete && image.naturalWidth > 0;
        });
        result.checks.push("Photo loads inside full-screen native modal");
        assert.equal(await page.locator(".lightbox-close").evaluate((element) => element === document.activeElement), true);
        const controlCount = await page.locator(".lightbox").evaluate((element) => element.querySelectorAll("button:not([disabled]), [tabindex='0']").length);
        for (let index = 0; index < controlCount; index++) await page.keyboard.press("Tab");
        assert.equal(await page.locator(".lightbox-close").evaluate((element) => element === document.activeElement), true, "Tab cycles only modal controls");
        await page.keyboard.press("Shift+Tab");
        assert.equal(await page.locator(".lightbox-zoom-controls button:last-child").evaluate((element) => element === document.activeElement), true);
        result.checks.push("Initial focus, Tab loop and Shift+Tab loop");
        await page.keyboard.press("+");
        await waitForScale(page, 1.5);
        await page.keyboard.press("-");
        await waitForScale(page, 1);
        await page.keyboard.press("+");
        await page.keyboard.press("0");
        await waitForScale(page, 1);
        if (count > 1) {
          await page.keyboard.press("ArrowRight");
          assert.equal(await activeNumber(page), 2);
          await page.keyboard.press("ArrowLeft");
          assert.equal(await activeNumber(page), 1);
        }
        result.checks.push("Keyboard zoom, reset, and available photo navigation");
        const bounds = await page.locator(".lightbox-stage").boundingBox();
        // Keep multi-touch start points clear of the side navigation buttons.
        const center = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 + 80 };
        if (engine === "chromium") {
          const session = await context.newCDPSession(page);
          await touchSequence(session, [
            [[1, center.x - 60, center.y], [2, center.x + 60, center.y]],
            [[1, center.x - 90, center.y], [2, center.x + 90, center.y]],
            [[1, center.x - 120, center.y], [2, center.x + 120, center.y]],
          ]);
          await waitForScale(page, 2);
          const beforePan = await imageView(page);
          await touchSequence(session, [
            [[1, center.x, center.y]],
            [[1, center.x + 35, center.y + 40]],
            [[1, center.x + 70, center.y + 80]],
          ]);
          const panned = await imageView(page);
          assert.ok(panned.x - beforePan.x > 40 && panned.y - beforePan.y > 40, "Touch pan moves the enlarged photograph");
          assert.ok(Math.abs(panned.scale - 2) < 0.01);
          await page.keyboard.press("0");
          await waitForScale(page, 1);
          await touchSequence(session, [
            [[1, center.x - 20, center.y], [2, center.x + 20, center.y]],
            [[1, center.x - 80, center.y], [2, center.x + 80, center.y]],
            [[1, center.x - 150, center.y], [2, center.x + 150, center.y]],
          ]);
          await waitForScale(page, 4);
          await touchSequence(session, [
            [[1, center.x - 150, center.y], [2, center.x + 150, center.y]],
            [[1, center.x - 45, center.y], [2, center.x + 45, center.y]],
            [[1, center.x - 10, center.y], [2, center.x + 10, center.y]],
          ]);
          await waitForScale(page, 1);
          result.checks.push("Real browser multi-touch pinch from 1× to 2×, one-finger pan, and 1×–4× clamps");
          await touchSequence(session, [
            [[1, center.x + 90, center.y]],
            [[1, center.x, center.y]],
            [[1, center.x - 90, center.y]],
          ]);
          assert.equal(await activeNumber(page), count > 1 ? 2 : 1, "Swipe advances only when another portrait exists");
          result.checks.push("Real touch swipe navigation and single-photo guard");
          await session.detach();
        } else {
          await page.keyboard.press("+");
          await page.keyboard.press("+");
          await waitForScale(page, 2);
          await page.mouse.move(center.x, center.y);
          await page.mouse.down();
          await page.mouse.move(center.x + 70, center.y + 80, { steps: 4 });
          await page.mouse.up();
          const panned = await imageView(page);
          assert.ok(panned.x > 40 && panned.y > 40, "Pointer pan works in WebKit");
          await page.keyboard.press("0");
          result.checks.push("WebKit pointer pan at 2× and reset");
        }
        await page.screenshot({ path: path.join(output, `${engine}-${route}-lightbox.png`) });
        const sizes = await page.locator(".lightbox button").evaluateAll((buttons) => buttons.map((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })));
        assert.ok(sizes.every((size) => size.width >= 44 && size.height >= 44), "Every viewer button meets 44px minimum");
        await page.keyboard.press("Escape");
        await page.locator("dialog.lightbox").waitFor({ state: "detached" });
        assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, "Focus returns to the invoking gallery tile");
        assert.ok(Math.abs(await page.evaluate(() => scrollY) - originalScroll) < 2, "Underlying invitation scroll position is restored");
        assert.equal(await page.evaluate(() => document.body.style.position), "", "Scroll locking styles are restored");
        assert.equal(result.errors.length, 0, "No browser JavaScript errors");
        result.checks.push("44px targets, Escape closes, trigger focus and scroll position restored, no JS errors");
        result.passed = true;
      } catch (error) {
        result.failure = error.stack;
        result.failureState = await page.evaluate(() => ({ url: location.href, openDialogs: document.querySelectorAll("dialog[open]").length, gateVisible: Boolean(document.querySelector(".invitation-gate")) })).catch(() => null);
        await page.screenshot({ path: path.join(output, `${engine}-${route}-failure.png`) }).catch(() => {});
      } finally {
        await context.close();
        console.log(`${engine}/${route}: ${result.passed ? "PASS" : "FAIL"} (${result.checks.length} checks)`);
        if (result.failure) console.log(result.failure);
      }
    }
  } catch (error) {
    report.results.push({ engine, passed: false, failure: error.stack });
    console.log(`${engine}: ${error.message}`);
  } finally {
    await browser?.close();
  }
}

await writeFile(path.join(output, language === "en" ? "report.json" : "report-"+language+".json"), `${JSON.stringify(report, null, 2)}\n`);
assert.ok(report.results.every((result) => result.passed), "Gallery verification failures are listed in artifacts/qa/gallery/report.json");
