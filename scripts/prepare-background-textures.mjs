import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const textures = {};
for (const [event, name] of [["wedding", "paper-grain"], ["homecoming", "velvet-grain"]]) {
  let seed = event === "wedding" ? 7421 : 1907;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const pixels = Buffer.alloc(128 * 128 * 3);
  for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
    const weave = event === "wedding" ? ((x + y) % 4 === 0 ? 14 : 0) : Math.sin(x * Math.PI / 16) * 20 + (y % 3 === 0 ? 9 : 0);
    const value = Math.round(128 + (random() - .5) * 94 + weave);
    pixels.fill(value, (y * 128 + x) * 3, (y * 128 + x) * 3 + 3);
  }
  const buffer = await sharp(pixels, { raw: { width: 128, height: 128, channels: 3 } }).webp({ quality: 75, effort: 6 }).toBuffer();
  const filename = `${name}.${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}.webp`;
  await fs.mkdir(`public/assets/${event}/backgrounds`, { recursive: true });
  await fs.writeFile(`public/assets/${event}/backgrounds/${filename}`, buffer);
  textures[event] = { src: `/assets/${event}/backgrounds/${filename}`, bytes: buffer.length, width: 128, height: 128, format: "webp", use: "Static repeating background texture; never animated" };
}
await fs.writeFile("src/data/background-textures.json", JSON.stringify(textures, null, 2) + "\n");
await fs.writeFile("media-sources/background-texture-inventory.json", JSON.stringify(textures, null, 2) + "\n");
console.log(JSON.stringify(textures));
