import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const ffprobe = process.env.FFPROBE_PATH || ".task-tools/ffmpeg/bin/ffprobe.exe";
const directory = "public/assets/homecoming/media";
const photoAssets = JSON.parse(await fs.readFile("src/data/photo-assets.json", "utf8"));
const videoAssets = JSON.parse(await fs.readFile("src/data/video-assets.json", "utf8"));
const oldVideo = videoAssets.homecoming;
const inventory = JSON.parse(await fs.readFile("media-sources/compatible-video-inventory.json", "utf8"));
const portraitInventory = JSON.parse(await fs.readFile("media-sources/portrait-inventory.json", "utf8"));

function checked(file) {
  const resolved = path.resolve(root, file);
  if (!resolved.startsWith(root + path.sep)) throw Error("Media paths must stay within this workspace");
  return resolved;
}
async function archiveUpload(upload, archive) {
  await fs.mkdir(path.dirname(checked(archive)), { recursive: true });
  if (await fs.access(checked(upload)).then(() => true, () => false)) {
    await fs.rename(checked(upload), checked(archive));
  }
  await fs.access(checked(archive));
  return archive;
}
async function save(buffer, stem, extension) {
  const filename = `${stem}.${createHash("sha256").update(buffer).digest("hex").slice(0, 12)}.${extension}`;
  await fs.writeFile(checked(path.join(directory, filename)), buffer);
  return { src: `/assets/homecoming/media/${filename}`, bytes: buffer.length };
}
const blur = async pipeline => `data:image/webp;base64,${(await pipeline.clone().resize({ width: 8 }).webp({ quality: 25 }).toBuffer()).toString("base64")}`;
const probe = file => JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
const encode = args => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args]);

await fs.mkdir(checked(directory), { recursive: true });
const heroSource = await archiveUpload("public/assets/homecoming/optimized/couple-artwork.jpg", "media-sources/homecoming/photos/homecoming-hero-couple.jpg");
const gallerySource = await archiveUpload("public/assets/homecoming/media/portrait-1-1080.6804e8a9ebfb.jpeg", "media-sources/homecoming/photos/homecoming-gallery-couple.jpeg");
const videoSource = await archiveUpload("public/assets/homecoming/media/homecoming-opening-couple.fb07dd087000.mp4", "media-sources/homecoming/videos/homecoming-opening-couple-replacement.mp4");

const hero = sharp(heroSource).rotate().resize({ width: 900, height: 900, fit: "inside", withoutEnlargement: true });
const heroOutput = await hero.clone().webp({ quality: 82, effort: 5 }).toBuffer({ resolveWithObject: true });
photoAssets.homecoming.artwork = { ...await save(heroOutput.data, "homecoming-hero-couple", "webp"), original: "/assets/homecoming/photos/homecoming-hero-couple.jpg", width: heroOutput.info.width, height: heroOutput.info.height, blurDataURL: await blur(hero), alt: "Janith and Pradeepa", kind: "photo" };

const portrait = sharp(gallerySource).rotate().modulate({ brightness: 1.025, saturation: .99 }).linear(.98, 2).recomb([[1.01, 0, 0], [0, 1, 0], [0, 0, .99]]);
const variants = {};
for (const width of [640, 1080]) {
  const resized = portrait.clone().resize({ width, withoutEnlargement: true });
  variants[width] = {
    webp: await save(await resized.clone().webp({ quality: 82, effort: 5 }).toBuffer(), `portrait-1-${width}`, "webp"),
    avif: await save(await resized.clone().avif({ quality: 55, effort: 5 }).toBuffer(), `portrait-1-${width}`, "avif"),
  };
}
const dimensions = await portrait.clone().resize({ width: 640, withoutEnlargement: true }).toBuffer({ resolveWithObject: true });
const gallery = { ...variants[640].webp, original: "/assets/homecoming/photos/homecoming-gallery-couple.jpeg", width: dimensions.info.width, height: dimensions.info.height, blurDataURL: await blur(portrait), alt: "Janith and Pradeepa", avif: variants[640].avif.src, large: variants[1080], objectPosition: "50% 30%" };
photoAssets.homecoming.gallery[0] = gallery;
photoAssets.homecoming.feature = gallery;
const originalPortrait = await sharp(gallerySource).metadata();
Object.assign(portraitInventory.find(row => row.event === "homecoming"), { source: gallerySource, originalBytes: (await fs.stat(gallerySource)).size, originalFormat: originalPortrait.format, originalWidth: originalPortrait.width, originalHeight: originalPortrait.height, variants });

const temporary = path.join(directory, "homecoming-opening-replacement.work.mp4");
encode(["-i", videoSource, "-an", "-vf", "scale=406:720,setsar=1,fps=24", "-c:v", "libx264", "-threads", "2", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-crf", "26", "-maxrate", "1800k", "-bufsize", "2400k", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-fps_mode", "cfr", "-movflags", "+faststart", temporary]);
const data = await fs.readFile(temporary);
const mp4 = await save(data, "homecoming-opening-couple-replacement", "mp4");
await fs.unlink(checked(temporary));
const outputPath = "public" + mp4.src;
const metadata = probe(outputPath), originalVideo = probe(videoSource), stream = metadata.streams.find(s => s.codec_type === "video");
if (stream.profile !== "Main" || stream.pix_fmt !== "yuv420p" || stream.avg_frame_rate !== "24/1" || metadata.streams.some(s => s.codec_type === "audio") || Math.abs(Number(metadata.format.duration) - Number(originalVideo.format.duration)) > .05 || mp4.bytes > 1500000 || data.indexOf(Buffer.from("moov")) > data.indexOf(Buffer.from("mdat"))) throw Error("Replacement opening failed its compatibility audit");
encode(["-i", outputPath, "-f", "null", "-"]);
const posterTemporary = path.join(directory, "homecoming-opening-replacement.work.webp");
encode(["-ss", "1", "-i", outputPath, "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", posterTemporary]);
const poster = await save(await fs.readFile(posterTemporary), "homecoming-opening-couple-replacement-poster", "webp");
await fs.unlink(checked(posterTemporary));
const opening = { ...mp4, sourcePath: videoSource, description: "Replacement homecoming opening couple film", position: "50% 50%", width: stream.width, height: stream.height, duration: Number(metadata.format.duration), fps: 24, originalBytes: Number(originalVideo.format.size), codec: "h264", profile: "Main", level: 31, pixelFormat: "yuv420p", hasAudio: false, fastStart: true, keyframeSeconds: 2, poster: { ...poster, width: stream.width, height: stream.height, blurDataURL: await blur(sharp("public" + poster.src)) } };
videoAssets.homecoming = opening;

// Retain prior source and derivative history outside public; the old hashed
// URL must never serve the user's replacement binary under an immutable name.
if (oldVideo.src !== opening.src) {
  for (const asset of [oldVideo, oldVideo.webm, oldVideo.poster].filter(Boolean)) {
    const archived = path.join("media-sources/homecoming/compatible", path.basename(asset.src));
    await fs.mkdir(path.dirname(checked(archived)), { recursive: true });
    if (!(await fs.access(checked(archived)).then(() => true, () => false))) {
      const previous = await fs.readFile(checked("public" + asset.src)).catch(() => execFileSync("git", ["show", `HEAD:public${asset.src}`], { maxBuffer: 10 * 1024 * 1024 }));
      await fs.writeFile(checked(archived), previous);
    }
    await fs.unlink(checked("public" + asset.src)).catch(error => { if (error.code !== "ENOENT") throw error; });
    asset.src = archived.replaceAll("\\", "/");
  }
  const previousEntry = inventory.find(row => row.sourcePath === oldVideo.sourcePath);
  if (previousEntry) Object.assign(previousEntry, oldVideo, { deployed: false, use: "superseded opening; archived outside public" });
}
const replacementEntry = inventory.find(row => row.sourcePath === videoSource);
if (replacementEntry) Object.assign(replacementEntry, opening, { deployed: true, use: "opening" });
else inventory.push({ ...opening, deployed: true, use: "opening" });

await fs.writeFile("src/data/photo-assets.json", JSON.stringify(photoAssets, null, 2) + "\n");
await fs.writeFile("src/data/video-assets.json", JSON.stringify(videoAssets, null, 2) + "\n");
await fs.writeFile("media-sources/compatible-video-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
await fs.writeFile("media-sources/portrait-inventory.json", JSON.stringify(portraitInventory, null, 2) + "\n");
const report = { hero: { source: heroSource, originalBytes: (await fs.stat(heroSource)).size, optimized: photoAssets.homecoming.artwork }, gallery: { source: gallerySource, originalBytes: (await fs.stat(gallerySource)).size, optimized: gallery }, opening };
await fs.writeFile("media-sources/homecoming-replacement-inventory.json", JSON.stringify(report, null, 2) + "\n");
console.log(`Hero: ${report.hero.originalBytes} -> ${report.hero.optimized.bytes} bytes`);
console.log(`Gallery: ${report.gallery.originalBytes} -> ${gallery.bytes} bytes (640 WebP), plus AVIF and viewer variants`);
console.log(`Opening: ${opening.originalBytes} -> ${opening.bytes} bytes, ${opening.duration}s, full decode passed`);
