import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, readFile, stat, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ffmpeg = process.env.FFMPEG_PATH || path.resolve(".task-tools/ffmpeg/bin/ffmpeg.exe");
const ffprobe = process.env.FFPROBE_PATH || path.join(path.dirname(ffmpeg), "ffprobe.exe");
const clips = [
  { event: "wedding", name: "cover", file: "wedding-floral-frame-loop.mp4", description: "Ivory roses framing a clear paper centre", position: "50% 50%" },
  { event: "wedding", name: "hero", file: "wedding-hero-loop.mp4", description: "Ivory silk, soft bokeh and white florals", position: "50% 50%" },
  { event: "wedding", name: "closing", file: "wedding-closing-loop.mp4", description: "Ivory petals drifting between soft drapes", position: "50% 50%" },
  { event: "homecoming", name: "silk", file: "homecoming-hero-loop.mp4", description: "Maroon silk and slow gold particles; shared cover and hero", position: "50% 50%" },
  { event: "homecoming", name: "closing", file: "homecoming-closing-loop.mp4", description: "Gold bokeh and a few rose petals on maroon", position: "50% 50%" },
];
function run(binary, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(binary, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    process.stdout.on("data", chunk => { out += chunk; });
    process.stderr.on("data", chunk => { err += chunk; });
    process.on("error", reject);
    process.on("close", code => code === 0 ? resolve(out) : reject(new Error(err)));
  });
}
const probe = async file => JSON.parse(await run(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", file]));
const manifest = {};
for (const clip of clips) {
  const sourcePath = `media-sources/${clip.event}/videos/${clip.file}`;
  const source = await stat(sourcePath).then(() => sourcePath).catch(() => `public/assets/${clip.event}/videos/${clip.file}`);
  const output = `public/assets/${clip.event}/optimized`;
  await mkdir(output, { recursive: true });
  const mp4 = `${output}/${clip.name}-mobile.mp4`;
  const webm = `${output}/${clip.name}-mobile.webm`;
  const poster = `${output}/${clip.name}-poster.webp`;
  const common = ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-map", "0:v:0", "-an", "-sn", "-dn", "-vf", "scale=540:-2,fps=24", "-map_metadata", "-1"];
  await run(ffmpeg, [...common, "-c:v", "libx264", "-threads", "2", "-preset", "medium", "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4]);
  await run(ffmpeg, [...common, "-c:v", "libvpx-vp9", "-threads", "2", "-row-mt", "1", "-deadline", "good", "-cpu-used", "4", "-crf", "38", "-b:v", "0", "-pix_fmt", "yuv420p", webm]);
  await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", "1", "-i", source, "-vf", "scale=540:-2", "-frames:v", "1", poster]);
  await sharp(await readFile(poster)).webp({ quality: 76 }).toBuffer().then(bytes => writeFile(poster, bytes));
  const originalInfo = await probe(source), info = await probe(mp4);
  const stream = info.streams.find(item => item.codec_type === "video");
  const bytes = (await stat(mp4)).size, webmBytes = (await stat(webm)).size;
  assert.ok(bytes <= 1_500_000, "Mobile clip exceeds 1.5MB: " + clip.name);
  assert.ok(!info.streams.some(item => item.codec_type === "audio"));
  assert.equal(stream.width, 540);
  assert.equal(stream.avg_frame_rate, "24/1");
  assert.ok(Math.abs(Number(info.format.duration) - Number(originalInfo.format.duration)) < .1);
  const buffer = await readFile(mp4);
  assert.ok(buffer.indexOf("moov") < buffer.indexOf("mdat"), "MP4 faststart missing");
  await run(ffmpeg, ["-v", "error", "-i", mp4, "-f", "null", "-"]);
  const metadata = await sharp(poster).metadata();
  const entry = {
    src: `/assets/${clip.event}/optimized/${clip.name}-mobile.mp4`,
    sourcePath, description: clip.description, position: clip.position,
    width: stream.width, height: stream.height, duration: Number(info.format.duration), fps: 24,
    bytes, originalBytes: (await stat(source)).size, hasAudio: false, fastStart: true,
    poster: { src: `/assets/${clip.event}/optimized/${clip.name}-poster.webp`, width: metadata.width, height: metadata.height, bytes: (await stat(poster)).size },
  };
  if (webmBytes < bytes) {
    entry.webm = { src: `/assets/${clip.event}/optimized/${clip.name}-mobile.webm`, bytes: webmBytes };
    await run(ffmpeg, ["-v", "error", "-i", webm, "-f", "null", "-"]);
  } else await unlink(webm);
  manifest[clip.event] ??= {};
  if (clip.name === "silk") { manifest[clip.event].cover = entry; manifest[clip.event].hero = entry; }
  else manifest[clip.event][clip.name] = entry;
  console.log(`${clip.event}/${clip.name}: ${entry.originalBytes} -> MP4 ${bytes}, WebM ${webmBytes}${entry.webm ? " (retained)" : " (omitted)"}`);
}
await writeFile("src/data/background-videos.json", JSON.stringify(manifest, null, 2) + "\n");
