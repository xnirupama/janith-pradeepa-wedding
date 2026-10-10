import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Supply FFMPEG_PATH and FFPROBE_PATH to use an existing installation.
// Portable defaults live inside the ignored .task-tools directory.
const ffmpeg = process.env.FFMPEG_PATH || path.resolve(".task-tools/ffmpeg/bin/ffmpeg.exe");
const ffprobe = process.env.FFPROBE_PATH || path.join(path.dirname(ffmpeg), "ffprobe.exe");
const root = process.cwd();
const manifest = {};
const frames = path.join(root, ".task-tools", "frames");
await mkdir(frames, { recursive: true });

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(`${path.basename(binary)} exited ${code}: ${stderr}`)));
  });
}
async function probe(file) {
  return JSON.parse(await run(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]));
}
function duration(info) {
  const video = info.streams.find((stream) => stream.codec_type === "video");
  return Number(video.duration ?? info.format.duration);
}
function atoms(buffer) {
  const result = [];
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const size = buffer.readUInt32BE(offset);
    result.push(buffer.toString("ascii", offset + 4, offset + 8));
    if (size < 8) break;
    offset += size;
  }
  return result;
}

for (const event of ["wedding", "homecoming"]) {
  const originalSrc = `/assets/${event}/videos/${event}-opening-couple.mp4`;
  const source = path.join(root, "public", originalSrc);
  const directory = path.join(root, "public", "assets", event, "optimized");
  const destination = path.join(directory, "opening-mobile.mp4");
  const frame = path.join(frames, `${event}-opening-frame.png`);
  const posterPath = path.join(directory, "opening-poster.webp");
  await mkdir(directory, { recursive: true });
  const originalInfo = await probe(source);
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-i", source,
    "-map", "0:v:0", "-an", "-sn", "-dn",
    "-vf", "scale=w='min(720,iw)':h='min(720,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
    "-c:v", "libx264", "-preset", "medium", "-crf", "26", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "-map_metadata", "-1", destination,
  ]);
  await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-map", "0:v:0", "-frames:v", "1", frame]);
  const poster = await sharp(frame).rotate().resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(posterPath);
  const blur = await sharp(posterPath).resize({ width: 8, height: 8, fit: "inside" }).webp({ quality: 35 }).toBuffer();
  const info = await probe(destination);
  const video = info.streams.find((stream) => stream.codec_type === "video");
  const originalBytes = (await stat(source)).size;
  const bytes = (await stat(destination)).size;
  const atomList = atoms(await readFile(destination));
  assert.equal(video.codec_name, "h264");
  assert.equal(video.pix_fmt, "yuv420p");
  assert.ok(Math.max(video.width, video.height) <= 720);
  assert.ok(Math.abs(duration(info) - duration(originalInfo)) < 0.1, "Opening film duration is preserved");
  assert.ok(!info.streams.some((stream) => stream.codec_type === "audio"));
  assert.ok(atomList.indexOf("moov") >= 0 && atomList.indexOf("moov") < atomList.indexOf("mdat"), "MP4 is ready to play before the complete download");
  manifest[event] = {
    src: `/assets/${event}/optimized/opening-mobile.mp4`,
    originalSrc,
    width: video.width,
    height: video.height,
    duration: duration(info),
    bytes,
    originalBytes,
    codec: "h264",
    pixelFormat: "yuv420p",
    hasAudio: false,
    fastStart: true,
    poster: {
      src: `/assets/${event}/optimized/opening-poster.webp`,
      width: poster.width,
      height: poster.height,
      bytes: poster.size,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    },
  };
  console.log(`${event}: ${video.width}×${video.height}, ${duration(info).toFixed(2)}s; ${Math.round(originalBytes / 1024)} KB → ${Math.round(bytes / 1024)} KB (${Math.round((1 - bytes / originalBytes) * 100)}% smaller)`);
}

await writeFile(path.join(root, "src", "data", "video-assets.json"), `${JSON.stringify(manifest, null, 2)}\n`);
