import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const ffprobe = process.env.FFPROBE_PATH || ".task-tools/ffmpeg/bin/ffprobe.exe";
const backgrounds = JSON.parse(await fs.readFile("src/data/background-videos.json", "utf8"));
const output = "artifacts/qa/immersive-v2-frames";
await fs.mkdir(output, { recursive: true });
for (const [event, name] of [["wedding", "wedding-soft-light-loop"], ["homecoming", "homecoming-hero-loop"]]) {
  const sourcePath = `media-sources/${event}/videos/${name}.mp4`;
  const directory = `public/assets/${event}/media`;
  const temporary = path.join(directory, `${name}-immersive.work.mp4`);
  // End on the starting timestamp with a one-second dissolve, avoiding a cut.
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", sourcePath,
    "-filter_complex", "[0:v]scale=540:960,setsar=1,fps=24,split=2[a][b];[a]trim=start=1:end=10,setpts=PTS-STARTPTS[tail];[b]trim=start=0:end=1.083333,setpts=PTS-STARTPTS[head];[tail][head]xfade=transition=fade:duration=1:offset=8,format=yuv420p[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-threads", "2", "-filter_complex_threads", "1", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-crf", "27", "-maxrate", "1400k", "-bufsize", "2800k", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-fps_mode", "cfr", "-movflags", "+faststart", temporary]);
  const hashed = async (file, stem, extension) => {
    const data = await fs.readFile(file);
    const filename = `${stem}.${createHash("sha256").update(data).digest("hex").slice(0, 12)}.${extension}`;
    await fs.writeFile(path.join(directory, filename), data);
    await fs.unlink(file);
    return { src: `/assets/${event}/media/${filename}`, bytes: data.length, data };
  };
  const mp4 = await hashed(temporary, name + "-immersive", "mp4"), file = "public" + mp4.src;
  const probe = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
  const video = probe.streams.find(s => s.codec_type === "video");
  if (video.profile !== "Main" || video.pix_fmt !== "yuv420p" || video.avg_frame_rate !== "24/1" || video.width !== 540 || probe.streams.some(s => s.codec_type === "audio") || mp4.bytes > 2000000 || mp4.data.indexOf(Buffer.from("moov")) > mp4.data.indexOf(Buffer.from("mdat"))) throw Error(`Invalid mobile loop: ${name}`);
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "null", "-"]);
  const raw = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-vf", "scale=180:320", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"], { maxBuffer: 48 * 1024 * 1024 });
  const length = 180 * 320 * 3, frames = Math.floor(raw.length / length);
  let brightest = 0, darkest = 0, high = -1, low = Infinity;
  for (let frame = 0; frame < frames; frame++) {
    let sum = 0;
    for (let i = frame * length; i < (frame + 1) * length; i += 3) sum += .2126 * raw[i] + .7152 * raw[i + 1] + .0722 * raw[i + 2];
    if (sum > high) { high = sum; brightest = frame; }
    if (sum < low) { low = sum; darkest = frame; }
  }
  const first = raw.subarray(0, length), last = raw.subarray((frames - 1) * length, frames * length);
  const seamMAD = first.reduce((sum, value, i) => sum + Math.abs(value - last[i]), 0) / length;
  if (seamMAD > 6) throw Error(`Loop seam needs review: ${name}, ${seamMAD}`);
  for (const [label, frame] of [["brightest", brightest], ["darkest", darkest]]) {
    execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", file, "-vf", `select=eq(n\\,${frame})`, "-frames:v", "1", `${output}/${event}-${label}.png`]);
  }
  const posterFile = path.join(directory, name + ".work.webp");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", "3", "-i", file, "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", posterFile]);
  const poster = await hashed(posterFile, name + "-immersive-poster", "webp");
  const blur = await sharp(poster.data).resize({ width: 8 }).webp({ quality: 25 }).toBuffer();
  const clip = { src: mp4.src, sourcePath, description: name.replaceAll("-", " ") + " with seamless dissolve", position: "50% 50%", width: 540, height: 960, duration: Number(probe.format.duration), fps: 24, bytes: mp4.bytes, originalBytes: (await fs.stat(sourcePath)).size, codec: "h264", profile: "Main", level: 31, pixelFormat: "yuv420p", hasAudio: false, fastStart: true, keyframeSeconds: 2, seamMeanAbsoluteDifference: Number(seamMAD.toFixed(2)), brightestFrame: brightest, darkestFrame: darkest, analysedFrames: frames, poster: { src: poster.src, width: 540, height: 960, bytes: poster.bytes, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` } };
  backgrounds[event].page = clip;
  console.log(`${event}: ${clip.bytes} bytes; poster ${poster.bytes}; ${frames} frames inspected; seam ${seamMAD.toFixed(2)}; brightest ${brightest}, darkest ${darkest}`);
}
await fs.writeFile("src/data/background-videos.json", JSON.stringify(backgrounds, null, 2) + "\n");
