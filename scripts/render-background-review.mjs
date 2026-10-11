import fs from "node:fs/promises";
import sharp from "sharp";

const sections = ["gate", "hero-section", "invitation-message", "schedule-section", "countdown-section", "photo-feature", "gallery-section", "celebration-section", "location-section", "closing-section"];
const source = "artifacts/qa/backgrounds";
await fs.mkdir("docs/background-preview", { recursive: true });
for (const engine of ["chromium", "webkit"]) for (const event of ["wedding", "homecoming"]) {
  for (let group = 0; group < 4; group++) {
    const composite = [];
    let y = 0;
    for (const section of sections.slice(group * 3, group * 3 + 3)) {
      const label = Buffer.from(`<svg width="780" height="34"><rect width="100%" height="100%" fill="#fff"/><text x="8" y="23" font-size="16">${section}: full effects / reduced motion</text></svg>`);
      composite.push({ input: label, top: y, left: 0 }); y += 34;
      let height = 0;
      for (const [i, profile] of ["normal", "reduced-motion"].entries()) {
        const { data, info } = await sharp(`${source}/${engine}-${event}-${profile}-${section}.png`).resize({ width: 390 }).png().toBuffer({ resolveWithObject: true });
        composite.push({ input: data, top: y, left: i * 390 }); height = Math.max(height, info.height);
      }
      y += height + 8;
    }
    await sharp({ create: { width: 780, height: y, channels: 3, background: "#fff" } }).composite(composite).jpeg({ quality: 84 }).toFile(`docs/background-preview/${engine}-${event}-${group + 1}.jpg`);
  }
}
