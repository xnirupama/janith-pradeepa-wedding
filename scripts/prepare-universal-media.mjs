import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_PATH || path.join(root, ".task-tools/ffmpeg/bin/ffmpeg.exe");
const ffprobe = process.env.FFPROBE_PATH || path.join(root, ".task-tools/ffmpeg/bin/ffprobe.exe");
const selected = {
  "wedding-floral-frame-loop.mp4": ["wedding", "cover"],
  "wedding-hero-loop.mp4": ["wedding", "hero"],
  "wedding-closing-loop.mp4": ["wedding", "closing"],
  "wedding-opening-couple.mp4": ["wedding", "opening"],
  "homecoming-hero-loop.mp4": ["homecoming", "cover", "hero"],
  "homecoming-closing-loop.mp4": ["homecoming", "closing"],
  "homecoming-opening-couple.mp4": ["homecoming", "opening"],
};
const background = { wedding: {}, homecoming: {} }, opening = {}, inventory = [];
const probe = file => JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
const encode = args => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
async function hashed(file, stem, ext, directory) {
  const data = await fs.readFile(file);
  const name = `${stem}.${createHash("sha256").update(data).digest("hex").slice(0, 12)}.${ext}`;
  await fs.writeFile(path.join(directory, name), data);
  await fs.unlink(file);
  return { name, bytes: data.length, data };
}
for (const event of ["wedding", "homecoming"]) {
  const inputDir = path.join(root, "media-sources", event, "videos");
  for (const name of (await fs.readdir(inputDir)).filter(name => name.endsWith(".mp4")).sort()) {
    const source = path.join(inputDir, name);
    const assignment = selected[name];
    const isOpening = name.includes("opening");
    const directory = path.join(root, assignment ? `public/assets/${event}/media` : `media-sources/${event}/compatible`);
    await fs.mkdir(directory, { recursive: true });
    const stem = name.replace(/\.mp4$/, "").replaceAll(" ", "-");
    const temp = path.join(directory, `${stem}.work`);
    const width = isOpening ? 406 : 540, height = isOpening ? 720 : 960;
    const vf = `scale=${width}:${height},setsar=1,fps=24`;
    encode(["-i", source, "-an", "-vf", vf, "-c:v", "libx264", "-threads", "2", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-crf", isOpening ? "26" : "28", "-maxrate", isOpening ? "1800k" : "1200k", "-bufsize", "2400k", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-fps_mode", "cfr", "-movflags", "+faststart", "-f", "mp4", temp + ".mp4"]);
    const mp4 = await hashed(temp + ".mp4", stem, "mp4", directory);
    const output = path.join(directory, mp4.name), metadata = probe(output), video = metadata.streams.find(s => s.codec_type === "video");
    if (video.profile !== "Main" || video.level > 40 || video.pix_fmt !== "yuv420p" || video.avg_frame_rate !== "24/1" || metadata.streams.some(s => s.codec_type === "audio") || mp4.data.indexOf(Buffer.from("moov")) > mp4.data.indexOf(Buffer.from("mdat")) || mp4.bytes > (isOpening ? 3e6 : 1.5e6)) throw new Error(`Invalid output: ${name}`);
    encode(["-i", source, "-an", "-vf", vf, "-c:v", "libvpx-vp9", "-threads", "2", "-row-mt", "1", "-cpu-used", "4", "-b:v", "0", "-crf", "38", "-g", "48", "-pix_fmt", "yuv420p", "-fps_mode", "cfr", "-f", "webm", temp + ".webm"]);
    let webm;
    if ((await fs.stat(temp + ".webm")).size < mp4.bytes) webm = await hashed(temp + ".webm", stem, "webm", directory);
    else await fs.unlink(temp + ".webm");
    encode(["-ss", "1", "-i", output, "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", "-f", "webp", temp + ".webp"]);
    const poster = await hashed(temp + ".webp", stem + "-poster", "webp", directory);
    const blur = await sharp(poster.data).resize({ width: 8 }).webp({ quality: 25 }).toBuffer();
    encode(["-i", output, "-f", "null", "-"]);
    if (webm) encode(["-i", path.join(directory, webm.name), "-f", "null", "-"]);
    const prefix = assignment ? `/assets/${event}/media/` : `media-sources/${event}/compatible/`;
    const clip = {
      src: prefix + mp4.name, sourcePath: `media-sources/${event}/videos/${name}`,
      description: stem.replaceAll("-", " "), position: "50% 50%", width, height,
      duration: Number(metadata.format.duration), fps: 24, bytes: mp4.bytes,
      originalBytes: (await fs.stat(source)).size, codec: "h264", profile: "Main", level: 31,
      pixelFormat: "yuv420p", hasAudio: false, fastStart: true, keyframeSeconds: 2,
      poster: { src: prefix + poster.name, width, height, bytes: poster.bytes, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` },
      ...(webm ? { webm: { src: prefix + webm.name, bytes: webm.bytes } } : {}),
    };
    if (assignment) for (const use of assignment.slice(1)) {
      if (use === "opening") opening[event] = clip;
      else background[event][use] = clip;
    }
    inventory.push({ ...clip, deployed: Boolean(assignment), use: assignment?.slice(1).join(" + ") ?? "archived alternative; not deployed" });
    console.log(`${name}: ${clip.originalBytes} -> ${mp4.bytes} MP4${webm ? ` / ${webm.bytes} WebM` : ""}`);
  }
}
await fs.writeFile("src/data/background-videos.json", JSON.stringify(background, null, 2) + "\n");
await fs.writeFile("src/data/video-assets.json", JSON.stringify(opening, null, 2) + "\n");
await fs.writeFile("media-sources/compatible-video-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
