import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { captureSection } from "./qa-section-capture.mjs";

const { chromium } = await import(process.env.INVITATION_PLAYWRIGHT_MODULE ? pathToFileURL(process.env.INVITATION_PLAYWRIGHT_MODULE).href : "playwright");
const base = process.env.INVITATION_TEST_URL || "http://127.0.0.1:3102";
const output = "artifacts/qa/background-contrast";
await fs.mkdir(output, { recursive: true });
const sections = (process.env.QA_SECTIONS || "invitation-gate,hero-section,invitation-message,schedule-section,countdown-section,photo-feature,gallery-section,celebration-section,location-section,closing-section").split(",");
const luminance = rgb => rgb.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
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
    await page.goto(`${base}/${event}`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => !document.querySelector(".gate-button")?.disabled);
    await page.evaluate(() => document.fonts.ready);
    let invitationOpened = false;
    for (const sectionName of sections) {
      if (sectionName !== "invitation-gate" && !invitationOpened) {
        await page.locator(".gate-button").click();
        await page.waitForFunction(() => document.querySelector(".opening-film video").currentTime > .2);
        await page.locator(".opening-film-skip").click();
        await page.locator(".opening-film").waitFor({ state: "hidden" });
        await page.addStyleTag({ content: 'html { scroll-behavior: auto !important; } .section-navigator, .music-control, .language-toggle--floating { visibility: hidden !important; }' });
        invitationOpened = true;
      }
      const section = page.locator("." + sectionName);
      for (const node of await section.locator(".section-reveal").all()) {
        await node.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "center" }));
        await page.waitForTimeout(150);
      }
      await section.evaluate(el => el.scrollIntoView({ behavior: "instant", block: "start" }));
      for (const picture of await section.locator("img:not(.video-poster)").all()) await picture.evaluate(async image => { image.loading = "eager"; await image.decode(); });
      await page.waitForTimeout(1000);
      // Text boxes are sampled after hiding glyphs, retaining card backgrounds,
      // textures, images, ornaments and every layer's actual compositing.
      const words = await section.evaluate(root => {
        const bounds = root.getBoundingClientRect(), walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), rows = [];
        while (walker.nextNode()) {
          const node = walker.currentNode, el = node.parentElement;
          if (!node.textContent.trim() || el.closest('.page-background, .section-atmosphere, .mandala-layers, .rotation-frame, script, style')) continue;
          let visible = true;
          for (let ancestor = el; ancestor; ancestor = ancestor.parentElement) {
            const css = getComputedStyle(ancestor);
            if (css.display === "none" || css.visibility !== "visible" || Number(css.opacity) < .99) { visible = false; break; }
          }
          if (!visible) continue;
          const css = getComputedStyle(el), color = css.color.match(/[\d.]+/g).map(Number).slice(0, 3), range = document.createRange();
          range.selectNodeContents(node);
          const boxes = [...range.getClientRects()].map(r => ({ x: r.x - bounds.x, y: r.y - bounds.y, width: r.width, height: r.height })).filter(r => r.width > 0 && r.height > 0);
          if (!boxes.length) continue;
          rows.push({ text: node.textContent.trim(), selector: el.className || el.tagName, color, boxes });
          el.dataset.contrastText = "true";
        }
        return rows;
      });
      assert.ok(words.length, sectionName + " has no text samples");
      const style = await page.addStyleTag({ content: '[data-contrast-text="true"] { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }' });
      await section.evaluate(root => {
        for (const backdrop of root.querySelectorAll(".video-backdrop")) {
          const child = backdrop.querySelector(".video-poster, video"), sample = document.createElement("span");
          const css = getComputedStyle(child);
          sample.className = "contrast-video-bound";
          Object.assign(sample.style, { position: "absolute", inset: "0", opacity: backdrop.classList.contains("ambient-backdrop") ? getComputedStyle(backdrop).getPropertyValue("--ambient-opacity") : "1", mixBlendMode: css.mixBlendMode });
          backdrop.insertBefore(sample, backdrop.querySelector(".video-scrim"));
          for (const media of backdrop.querySelectorAll("video,.video-poster")) { media.dataset.contrastVisibility = media.style.visibility; media.style.visibility = "hidden"; }
        }
      });
      const minimums = words.map(() => Infinity);
      // Solid fills at each ornament's real opacity conservatively cover every
      // possible mandala rotation. A flat bokeh peak covers its full drift path.
      const boundStyle = await page.addStyleTag({ content: '.mandala-layers .rotation-layer { background: var(--accent); } .mandala-layers .rotation-layer > svg { visibility: hidden; } .section-watermarks svg { background: var(--accent); } .background-bokeh { background: rgba(var(--background-glow-rgb), .5); }' });
      for (const [pose, phase] of [["dark", .0], ["light", .84]]) {
        await page.evaluate(({ pose, phase }) => {
          for (const layer of document.querySelectorAll(".contrast-video-bound")) layer.style.background = pose === "dark" ? "#000" : "#fff";
          for (const animation of document.getAnimations()) {
            animation.pause();
            const timing = animation.effect.getTiming();
            animation.currentTime = Number(timing.duration) * phase;
          }
        }, { pose, phase });
        const png = sectionName === "invitation-gate" ? await section.screenshot({ path: `${output}/${event}-${sectionName}-${pose}.png` }) : await captureSection(page, section, `${output}/${event}-${sectionName}-${pose}.png`);
        const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
        for (const [index, word] of words.entries()) {
          const fg = luminance(word.color);
          for (const box of word.boxes) for (let y = Math.max(0, Math.ceil(box.y)); y < Math.min(info.height, Math.floor(box.y + box.height)); y++) for (let x = Math.max(0, Math.ceil(box.x)); x < Math.min(info.width, Math.floor(box.x + box.width)); x++) {
            const at = (y * info.width + x) * info.channels, bg = luminance([...data.subarray(at, at + 3)]), ratio = (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05);
            minimums[index] = Math.min(minimums[index], ratio);
          }
        }
      }
      const samples = words.map((word, index) => ({ text: word.text, selector: word.selector, color: word.color, ratio: Number(minimums[index].toFixed(2)) }));
      results.push({ event, section: sectionName, minimum: Math.min(...samples.map(s => s.ratio)), failures: samples.filter(s => s.ratio < 4.5), samples });
      console.log(JSON.stringify({ event, section: sectionName, minimum: results.at(-1).minimum, failures: results.at(-1).failures }));
      await style.evaluate(el => el.remove());
      await boundStyle.evaluate(el => el.remove());
      await page.evaluate(() => {
        for (const node of document.querySelectorAll("[data-contrast-text]")) delete node.dataset.contrastText;
        for (const node of document.querySelectorAll(".contrast-video-bound")) node.remove();
        for (const node of document.querySelectorAll("[data-contrast-visibility]")) { node.style.visibility = node.dataset.contrastVisibility; delete node.dataset.contrastVisibility; }
        for (const animation of document.getAnimations()) if (getComputedStyle(animation.effect.target).animationPlayState === "running") animation.play();
      });
    }
    await context.close();
  }
} finally { await browser.close(); }
await fs.writeFile(`${output}/results.json`, JSON.stringify(results, null, 2) + "\n");
assert.ok(results.every(row => row.minimum >= 4.5), "Text contrast below 4.5:1; inspect background-contrast/results.json");
