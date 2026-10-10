import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import sharp from "sharp";

const assets = JSON.parse(await fs.readFile("src/data/photo-assets.json", "utf8"));
const inventory = [];
async function save(buffer, directory, name, ext) {
  const filename = `${name}.${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}.${ext}`;
  await fs.writeFile(path.join(directory, filename), buffer);
  return { src: "/" + path.join(directory, filename).replaceAll("\\", "/").replace(/^public\//, ""), bytes: buffer.length };
}
for (const event of ["wedding", "homecoming"]) {
  const directory = `public/assets/${event}/media`;
  await fs.mkdir(directory, { recursive: true });
  for (const [index, photo] of assets[event].gallery.entries()) {
    const relative = decodeURIComponent(photo.original).replace(/^\/assets\//, "");
    const archive = path.join("media-sources", relative);
    const source = await fs.access(archive).then(() => archive, () => "public" + decodeURIComponent(photo.original));
    const original = await fs.readFile(source), metadata = await sharp(original).metadata();
    const portrait = sharp(original).rotate().modulate({ brightness: 1.025, saturation: .99 }).linear(.98, 2).recomb([[1.01, 0, 0], [0, 1, 0], [0, 0, .99]]);
    const variants = {};
    for (const width of [640, 1080]) {
      const pipeline = portrait.clone().resize({ width, withoutEnlargement: true });
      const [webp, avif] = await Promise.all([pipeline.clone().webp({ quality: 82, effort: 5 }).toBuffer(), pipeline.clone().avif({ quality: 55, effort: 5 }).toBuffer()]);
      variants[width] = { webp: await save(webp, directory, `portrait-${index + 1}-${width}`, "webp"), avif: await save(avif, directory, `portrait-${index + 1}-${width}`, "avif") };
    }
    const dimensions = await sharp(original).rotate().resize({ width: 640, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
    const blur = await portrait.clone().resize({ width: 8 }).webp({ quality: 25 }).toBuffer();
    Object.assign(photo, { src: variants[640].webp.src, avif: variants[640].avif.src, large: variants[1080], width: dimensions.info.width, height: dimensions.info.height, bytes: variants[640].webp.bytes, objectPosition: "50% 30%", blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` });
    inventory.push({ event, source: archive.replaceAll("\\", "/"), originalBytes: original.length, originalFormat: metadata.format, originalWidth: metadata.width, originalHeight: metadata.height, variants, use: "gallery; large variant only in lightbox" });
  }
  assets[event].feature = assets[event].gallery[0];
}
await fs.writeFile("src/data/photo-assets.json", JSON.stringify(assets, null, 2) + "\n");
await fs.writeFile("media-sources/portrait-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify(inventory));
