import fs from "node:fs/promises";
import sharp from "sharp";

const sections = ["hero-section", "invitation-message", "schedule-section", "countdown-section", "photo-feature", "gallery-section", "celebration-section", "location-section", "closing-section"];
const source = process.env.QA_SCREENSHOT_PREFIX || "artifacts/qa/ambient";
await fs.mkdir("docs/ambient-preview", { recursive: true });
for (const engine of ["chromium", "webkit"]) for (const event of ["wedding", "homecoming"]) {
  for (let group = 0; group < 3; group++) {
    const composite = [];
    let y = 0;
    for (const section of sections.slice(group * 3, group * 3 + 3)) {
      const label = Buffer.from(`<svg width="390" height="28"><rect width="100%" height="100%" fill="white"/><text x="5" y="19" font-size="12">${section}: video / poster-only</text></svg>`);
      composite.push({ input: label, top: y, left: 0 }); y += 28;
      let height = 0;
      for (const [i, profile] of ["normal", "disabled"].entries()) {
        const { data, info } = await sharp(`${source}-${engine}/${engine}-${event}-${profile}-${section}.png`).resize({ width: 195 }).png().toBuffer({ resolveWithObject: true });
        composite.push({ input: data, top: y, left: i * 195 }); height = Math.max(height, info.height);
      }
      y += height + 8;
    }
    await sharp({ create: { width: 390, height: y, channels: 3, background: "#ffffff" } }).composite(composite).jpeg({ quality: 88 }).toFile(`docs/ambient-preview/${engine}-${event}-${group + 1}.jpg`);
  }
}
