import fs from "node:fs";
import path from "node:path";

const SUPPORTED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export function getGalleryImages(event) {
  const directory = path.join(process.cwd(), "public", "assets", event, "gallery");

  try {
    return fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((filename) => ({
        src: `/assets/${event}/gallery/${encodeURIComponent(filename)}`,
        alt: `Janith and Pradeepa ${event} memory`,
      }));
  } catch {
    return [];
  }
}
