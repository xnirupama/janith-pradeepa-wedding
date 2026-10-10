import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const brand = {};
const lotus = '<path d="M0 22C-28 4-22-23 0-47c22 24 28 51 0 69ZM0 22C-42 22-53-6-46-25c28 3 43 22 46 47ZM0 22c42 0 53-28 46-47-28 3-43 22-46 47ZM-42 32c25-6 59-6 84 0"/>';
for (const event of ["wedding", "homecoming"]) {
  const wedding = event === "wedding";
  const bg = wedding ? "#f5eddc" : "#3b0715", gold = wedding ? "#806020" : "#e2c58c";
  const title = wedding ? "The Wedding" : "Homecoming Celebration";
  const date = wedding ? "26 November 2026" : "30 November 2026";
  const directory = `public/assets/${event}/share`;
  await fs.mkdir(directory, { recursive: true });
  const save = async (data, name, ext) => {
    const file = `${name}.${createHash("sha256").update(data).digest("hex").slice(0, 12)}.${ext}`;
    await fs.writeFile(`${directory}/${file}`, data);
    return { src: `/assets/${event}/share/${file}`, bytes: data.length };
  };
  const svg = (width, height) => {
    const square = width === height;
    const scale = square ? .75 : 1, cx = width / 2, cy = height / 2;
    const mandala = Array.from({ length: 24 }, (_, i) => `<path transform="rotate(${i * 15})" d="M0-90C-40-135-30-205 0-245c30 40 40 110 0 155Z"/>`).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${bg}"/><g transform="translate(${cx} ${cy}) scale(${scale})"><g fill="none" stroke="${gold}" opacity=".05">${mandala}<circle r="270"/><circle r="285"/></g></g><rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="22" fill="none" stroke="${gold}" opacity=".5"/><g transform="translate(${cx} ${square ? 145 : 145})" fill="none" stroke="${gold}" stroke-width="1.5">${lotus}</g><g text-anchor="middle" fill="${gold}" font-family="Georgia, 'Times New Roman', serif"><text x="${cx}" y="${square ? 250 : 260}" font-size="${square ? 21 : 25}" letter-spacing="3">${title}</text>${square ? `<text x="${cx}" y="335" font-size="55">Janith</text><text x="${cx}" y="384" font-size="32">&amp;</text><text x="${cx}" y="445" font-size="55">Pradeepa</text>` : `<text x="${cx}" y="365" font-size="76">Janith &amp; Pradeepa</text>`}<text x="${cx}" y="${square ? 510 : 445}" font-size="${square ? 23 : 30}">${date}</text></g></svg>`;
  };
  const wide = await sharp(Buffer.from(svg(1200, 630))).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  const square = await sharp(Buffer.from(svg(600, 600))).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  if (wide.length > 300000 || square.length > 300000) throw new Error("Social image too large");
  const iconSVG = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><rect width="180" height="180" rx="32" fill="${bg}"/><g transform="translate(90 100) scale(1.35)" fill="none" stroke="${gold}" stroke-width="2.5" stroke-linejoin="round">${lotus}</g></svg>`);
  const icon = await save(iconSVG, "lotus", "svg");
  const apple = await save(await sharp(iconSVG).png().toBuffer(), "apple-touch", "png");
  const pwa = await save(await sharp(iconSVG).resize(192, 192).png().toBuffer(), "lotus-192", "png");
  const pwa512 = await save(await sharp(iconSVG).resize(512, 512).png().toBuffer(), "lotus-512", "png");
  const png32 = await sharp(iconSVG).resize(32, 32).png().toBuffer();
  const header = Buffer.alloc(22); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4); header[6] = 32; header[7] = 32; header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png32.length, 14); header.writeUInt32LE(22, 18);
  const ico = await save(Buffer.concat([header, png32]), "lotus", "ico");
  const manifest = await save(Buffer.from(JSON.stringify({ name: `Janith & Pradeepa - ${title}`, short_name: "J & P", id: `/${event}`, start_url: `/${event}`, scope: `/${event}`, display: "standalone", background_color: bg, theme_color: bg, icons: [{ src: pwa.src, sizes: "192x192", type: "image/png" }, { src: pwa512.src, sizes: "512x512", type: "image/png" }] })), "invitation", "webmanifest");
  brand[event] = { wide: await save(wide, "preview-1200x630", "jpg"), square: await save(square, "preview-600x600", "jpg"), icon, ico, apple, pwa, pwa512, manifest };
}
await fs.writeFile("src/data/brand-assets.json", JSON.stringify(brand, null, 2) + "\n");
console.log(JSON.stringify(brand));
