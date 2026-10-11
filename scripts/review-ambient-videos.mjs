import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const ffprobe = process.env.FFPROBE_PATH || ".task-tools/ffmpeg/bin/ffprobe.exe";
const inventory = JSON.parse(await fs.readFile("media-sources/compatible-video-inventory.json", "utf8"));
const output = "artifacts/qa/ambient-review";
await fs.mkdir(output, { recursive: true });
const rows = [];
for (const clip of inventory) {
  const probe = file => {
    const data = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
    const v = data.streams.find(s => s.codec_type === "video");
    return { codec: v.codec_name, profile: v.profile, width: v.width, height: v.height, fps: v.avg_frame_rate, duration: Number(data.format.duration), bytes: Number(data.format.size), pixelFormat: v.pix_fmt, audio: data.streams.some(s => s.codec_type === "audio") };
  };
  const original = probe(clip.sourcePath);
  const optimizedPath = clip.src.startsWith("/") ? "public" + clip.src : clip.src;
  const optimized = probe(optimizedPath);
  const name = path.basename(clip.sourcePath, ".mp4");
  const frames = [];
  for (const time of [0, 5, 9.95]) {
    const frame = path.join(output, `${name}-${time}.png`);
    execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", String(time), "-i", clip.sourcePath, "-frames:v", "1", "-vf", "scale=180:320", frame]);
    frames.push(frame);
  }
  const first = await sharp(frames[0]).removeAlpha().raw().toBuffer();
  const last = await sharp(frames[2]).removeAlpha().raw().toBuffer();
  const seamMeanAbsoluteDifference = first.reduce((sum, value, i) => sum + Math.abs(value - last[i]), 0) / first.length;
  rows.push({ name, original, optimized, frames, seamMeanAbsoluteDifference: Number(seamMeanAbsoluteDifference.toFixed(2)) });
  console.log(`${name}: ${original.bytes} -> ${optimized.bytes}, seam MAD ${seamMeanAbsoluteDifference.toFixed(2)}`);
}
for (const event of ["wedding", "homecoming"]) {
  const clips = rows.filter(row => row.name.startsWith(event));
  const tiles = [];
  for (const [i, row] of clips.entries()) {
    const label = Buffer.from(`<svg width="560" height="28"><rect width="100%" height="100%" fill="#ffffff"/><text x="8" y="20" fill="#222" font-size="16">${row.name} — 0s / 5s / 9.95s</text></svg>`);
    tiles.push({ input: label, top: i * 356, left: 0 });
    for (const [j, frame] of row.frames.entries()) tiles.push({ input: frame, top: i * 356 + 28, left: j * 186 });
  }
  await sharp({ create: { width: 560, height: clips.length * 356, channels: 3, background: "#dddddd" } }).composite(tiles).png().toFile(path.join(output, `${event}-frames.png`));
}
await fs.writeFile("media-sources/ambient-frame-audit.json", JSON.stringify(rows, null, 2) + "\n");
