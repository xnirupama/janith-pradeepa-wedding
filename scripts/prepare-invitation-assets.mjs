import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Run with `node scripts/prepare-invitation-assets.mjs` after replacing originals.
// Originals stay untouched, including the artwork and OpenGraph source images.
const root = process.cwd();
const sources = {
  wedding: {
    feature: ["photos/wedding-couple-feature.jpeg", "couple-feature", 1600],
    second: ["photos/wedding-couple-feature 2.jpeg", "couple-feature-02", 1600],
    artwork: ["photos/wedding-couple-feature.png", "couple-artwork", 900],
    hero: ["backgrounds/wedding-hero-bg.jpeg", "hero-background", 1600],
    section: ["backgrounds/wedding-section-bg.jpeg", "section-background", 1600],
  },
  homecoming: {
    feature: ["photos/homecoming-couple-feature.jpeg", "couple-feature", 1600],
    artwork: ["photos/homecoming-couple-feature.png", "couple-artwork", 900],
    hero: ["backgrounds/homecoming-hero-bg.jpeg", "hero-background", 1600],
    section: ["backgrounds/homecoming-section-bg.jpeg", "section-background", 1600],
  },
};

const manifest = {};
for (const [event, assets] of Object.entries(sources)) {
  const outputDirectory = path.join(root, "public", "assets", event, "optimized");
  await mkdir(outputDirectory, { recursive: true });
  const prepared = {};
  for (const [key, [relative, filename, maximum]] of Object.entries(assets)) {
    const source = path.join(root, "public", "assets", event, relative);
    const output = path.join(outputDirectory, `${filename}.webp`);
    const result = await sharp(source)
      .rotate()
      .resize({ width: maximum, height: maximum, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toFile(output);
    // A real eight-pixel image makes the blur placeholder lightweight.
    const blur = await sharp(output)
      .resize({ width: 8, height: 8, fit: "inside" })
      .webp({ quality: 35 })
      .toBuffer();
    prepared[key] = {
      src: `/assets/${event}/optimized/${filename}.webp`,
      original: `/assets/${event}/${relative.split("/").map(encodeURIComponent).join("/")}`,
      width: result.width,
      height: result.height,
      bytes: result.size,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
      alt: "Janith and Pradeepa",
    };
    console.log(`${event}/${filename}.webp: ${result.width} × ${result.height}, ${Math.round(result.size / 1024)} KB`);
  }
  manifest[event] = {
    feature: prepared.feature,
    artwork: prepared.artwork,
    backgrounds: { hero: prepared.hero, section: prepared.section },
    gallery: [prepared.feature, prepared.second].filter(Boolean),
  };
}

await mkdir(path.join(root, "src", "data"), { recursive: true });
await writeFile(path.join(root, "src", "data", "photo-assets.json"), `${JSON.stringify(manifest, null, 2)}\n`);
