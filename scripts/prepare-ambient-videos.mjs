import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const ffprobe = process.env.FFPROBE_PATH || ".task-tools/ffmpeg/bin/ffprobe.exe";
const backgrounds = JSON.parse(await fs.readFile("src/data/background-videos.json", "utf8"));
const openings = JSON.parse(await fs.readFile("src/data/video-assets.json", "utf8"));
const inventory = JSON.parse(await fs.readFile("media-sources/compatible-video-inventory.json", "utf8"));
const assignments = [
  ["wedding", "hero", "wedding-floral-loop", .22, "multiply"],
  ["wedding", "celebration", "wedding-petals-loop", .24, "multiply"],
  ["homecoming", "hero", "homecoming-closing-loop", .22, "screen"],
];
const report = [];
for (const event of ["wedding", "homecoming"]) backgrounds[event] = { cover: backgrounds[event].cover };
for (const [event, section, name, opacity, blend] of assignments) {
  const sourcePath = `media-sources/${event}/videos/${name}.mp4`;
  const directory = `public/assets/${event}/media`;
  await fs.mkdir(directory, { recursive: true });
  const temporary = path.join(directory, `${name}-seamless.work.mp4`);
  // 1..10s crossfades into 0..1s. The nine-second output ends at its
  // starting source timestamp (including two boundary frames), so one video
  // can loop without a hard cut.
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", sourcePath,
    "-filter_complex", "[0:v]scale=540:960,setsar=1,fps=24,split=2[a][b];[a]trim=start=1:end=10,setpts=PTS-STARTPTS[tail];[b]trim=start=0:end=1.083333,setpts=PTS-STARTPTS[head];[tail][head]xfade=transition=fade:duration=1:offset=8,format=yuv420p[v]",
    "-map", "[v]", "-an", "-c:v", "libx264", "-threads", "2", "-filter_complex_threads", "1", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-crf", "28", "-maxrate", "1200k", "-bufsize", "2400k", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-fps_mode", "cfr", "-movflags", "+faststart", temporary]);
  const hashed = async (file, stem, extension) => {
    const data = await fs.readFile(file);
    const filename = `${stem}.${createHash("sha256").update(data).digest("hex").slice(0, 12)}.${extension}`;
    await fs.writeFile(path.join(directory, filename), data);
    await fs.unlink(file);
    return { src: `/assets/${event}/media/${filename}`, bytes: data.length, data };
  };
  const mp4 = await hashed(temporary, name + "-seamless", "mp4");
  const file = "public" + mp4.src;
  const probe = JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file]));
  const video = probe.streams.find(s => s.codec_type === "video");
  if (video.profile !== "Main" || video.pix_fmt !== "yuv420p" || video.avg_frame_rate !== "24/1" || probe.streams.some(s => s.codec_type === "audio") || mp4.bytes > 1500000 || mp4.data.indexOf(Buffer.from("moov")) > mp4.data.indexOf(Buffer.from("mdat"))) throw Error(`Invalid mobile loop: ${name}`);
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", file, "-f", "null", "-" ]);
  const posterFile = path.join(directory, name + ".work.webp");
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-ss", "3", "-i", file, "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", posterFile]);
  const poster = await hashed(posterFile, name + "-seamless-poster", "webp");
  const blur = await sharp(poster.data).resize({ width: 8 }).webp({ quality: 25 }).toBuffer();
  const endpoint = time => execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-ss", String(time), "-i", file, "-frames:v", "1", "-vf", "scale=180:320", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"]);
  const first = endpoint(0), last = endpoint(Number(probe.format.duration) - 1 / 24);
  const seamMAD = first.reduce((sum, value, i) => sum + Math.abs(value - last[i]), 0) / first.length;
  if (seamMAD > 6) throw Error(`Loop seam needs review: ${name}, ${seamMAD}`);
  const clip = { src: mp4.src, sourcePath, description: name.replaceAll("-", " ") + " with seamless dissolve", position: "50% 50%", width: 540, height: 960, duration: Number(probe.format.duration), fps: 24, bytes: mp4.bytes, originalBytes: (await fs.stat(sourcePath)).size, codec: "h264", profile: "Main", level: 31, pixelFormat: "yuv420p", hasAudio: false, fastStart: true, keyframeSeconds: 2, opacity, blend, seamMeanAbsoluteDifference: Number(seamMAD.toFixed(2)), poster: { src: poster.src, width: 540, height: 960, bytes: poster.bytes, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` } };
  backgrounds[event][section] = clip;
  report.push({ event, section, ...clip });
  console.log(`${event}/${section}: ${clip.originalBytes} -> ${clip.bytes} bytes, poster ${poster.bytes}, seam ${seamMAD.toFixed(2)}`);
}
const retained = new Set(Object.values(backgrounds).flatMap(v => Object.values(v)).concat(Object.values(openings)).flatMap(clip => [clip.src, clip.webm?.src, clip.poster.src]).filter(Boolean));
// Archive obsolete derivatives outside public. Never delete original media.
for (const event of ["wedding", "homecoming"]) {
  const directory = path.resolve(root, "public/assets", event, "media");
  const archive = path.resolve(root, "media-sources", event, "compatible");
  if (!directory.startsWith(root + path.sep) || !archive.startsWith(root + path.sep)) throw Error("Archive paths must stay in the workspace");
  await fs.mkdir(archive, { recursive: true });
  for (const name of await fs.readdir(directory)) {
    if (!/\.(mp4|webm)$/.test(name) && !/-poster\.[a-f0-9]{12}\.webp$/.test(name)) continue;
    const url = `/assets/${event}/media/${name}`;
    if (retained.has(url)) continue;
    const archivedPath = `media-sources/${event}/compatible/${name}`;
    await fs.rename(path.join(directory, name), path.join(archive, name));
    for (const clip of inventory) {
      if (clip.src === url) clip.src = archivedPath;
      if (clip.webm?.src === url) clip.webm.src = archivedPath;
      if (clip.poster.src === url) clip.poster.src = archivedPath;
    }
  }
}
for (const clip of inventory) {
  const selected = report.find(row => row.sourcePath === clip.sourcePath);
  if (selected) Object.assign(clip, selected, { deployed: true, use: selected.section });
  else { clip.deployed = retained.has(clip.src); clip.use = clip.deployed ? (clip.sourcePath.includes("opening") ? "opening" : "cover") : "archived alternative; not deployed"; }
  if (selected) delete clip.webm;
}
await fs.writeFile("src/data/background-videos.json", JSON.stringify(backgrounds, null, 2) + "\n");
await fs.writeFile("media-sources/ambient-placement-assets.json", JSON.stringify(report, null, 2) + "\n");
await fs.writeFile("media-sources/compatible-video-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
