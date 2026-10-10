import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import photoAssets from "@/data/photo-assets.json";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const EVENTS = new Set(["wedding", "homecoming"]);

export function getCoupleArtwork(event) {
  return photoAssets[event]?.artwork ?? null;
}

export async function getGalleryImages(event) {
  if (!EVENTS.has(event)) return [];
  const suppliedPortraits = photoAssets[event]?.gallery ?? [];
  const directory = path.join(process.cwd(), "public", "assets", event, "gallery");
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return suppliedPortraits;
  }

  const filenames = entries
    .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

  const extraPortraits = await Promise.all(filenames.map(async (filename) => {
    const source = path.join(directory, filename);
    try {
      const [metadata, blur] = await Promise.all([
        sharp(source).metadata(),
        sharp(source).rotate().resize({ width: 8, height: 8, fit: "inside" }).webp({ quality: 35 }).toBuffer(),
      ]);
      const dimensions = metadata.autoOrient ?? metadata;
      return {
        src: `/assets/${event}/gallery/${encodeURIComponent(filename)}`,
        width: dimensions.width,
        height: dimensions.height,
        blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
        alt: `Janith and Pradeepa ${event} memory`,
      };
    } catch {
      // A damaged uploaded file must not prevent an invitation from loading.
      return null;
    }
  }));

  return [...suppliedPortraits, ...extraPortraits.filter(Boolean)];
}
