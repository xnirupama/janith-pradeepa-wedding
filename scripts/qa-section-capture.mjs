import fs from "node:fs/promises";
import sharp from "sharp";

// Stitch real phone-viewport strips. Chromium's mobile element screenshots can
// omit compositor backgrounds below the viewport when a section is taller.
export async function captureSection(page, section, destination) {
  const bounds = await section.boundingBox(), width = Math.round(bounds.width), height = Math.floor(bounds.height);
  const strips = [];
  let offset = 0;
  while (offset < height) {
    await section.evaluate((el, at) => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY + at, behavior: "instant" }), offset);
    await page.waitForTimeout(120);
    const box = await section.boundingBox(), top = Math.max(0, Math.round(box.y + offset));
    const stripHeight = Math.min(height - offset, page.viewportSize().height - top);
    if (stripHeight <= 0) throw new Error("Section screenshot strip is outside the viewport");
    const input = await sharp(await page.screenshot()).extract({ left: Math.round(box.x), top, width, height: stripHeight }).png().toBuffer();
    strips.push({ input, top: offset, left: 0 });
    offset += stripHeight;
  }
  const png = await sharp({ create: { width, height, channels: 3, background: "#fff" } }).composite(strips).png().toBuffer();
  await fs.writeFile(destination, png);
  return png;
}
