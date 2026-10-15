import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

const root = process.cwd();
const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const ffprobe = process.env.FFPROBE_PATH || ".task-tools/ffmpeg/bin/ffprobe.exe";
const upload = "public/assets/wedding/media/wedding-opening-couple.4c6a4aef7654.mp4";
const sourcePath = "media-sources/wedding/videos/wedding-opening-couple-replacement.mp4";
const directory = "public/assets/wedding/media";
const assets = JSON.parse(await fs.readFile("src/data/video-assets.json", "utf8"));
const inventory = JSON.parse(await fs.readFile("media-sources/compatible-video-inventory.json", "utf8"));
const previous = structuredClone(assets.wedding);
const homecoming = JSON.stringify(assets.homecoming);
const digest = data => createHash("sha256").update(data).digest("hex");
const exists = file => fs.access(file).then(() => true, () => false);

function checked(file) {
  const absolute = path.resolve(root, file);
  assert.ok(absolute.startsWith(root + path.sep), "Media files must stay in this workspace");
  return absolute;
}
function encode(args) {
  execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { windowsHide: true, stdio: "inherit" });
}
function probe(file) {
  return JSON.parse(execFileSync(ffprobe, ["-v", "error", "-show_format", "-show_streams", "-of", "json", file], { windowsHide: true }));
}
async function save(file, stem, extension) {
  const data = await fs.readFile(checked(file));
  const name = `${stem}.${digest(data).slice(0, 12)}.${extension}`;
  await fs.writeFile(checked(path.join(directory, name)), data);
  await fs.unlink(checked(file));
  return { src: `/assets/wedding/media/${name}`, bytes: data.length };
}

await fs.mkdir(checked(path.dirname(sourcePath)), { recursive: true });
if (await exists(checked(upload))) {
  const original = await fs.readFile(checked(upload));
  if (await exists(checked(sourcePath))) {
    assert.equal(digest(await fs.readFile(checked(sourcePath))), digest(original), "A different replacement source is already archived");
  } else {
    await fs.writeFile(checked(sourcePath), original);
  }
}
const source = probe(checked(sourcePath));
const temporary = `${directory}/wedding-opening-replacement.work.mp4`;
encode(["-i", checked(sourcePath), "-map", "0:v:0", "-an", "-sn", "-dn", "-vf", "scale=406:720,setsar=1,fps=24", "-c:v", "libx264", "-threads", "2", "-preset", "medium", "-profile:v", "main", "-level:v", "3.1", "-pix_fmt", "yuv420p", "-crf", "26", "-maxrate", "1800k", "-bufsize", "2400k", "-g", "48", "-keyint_min", "48", "-sc_threshold", "0", "-fps_mode", "cfr", "-movflags", "+faststart", checked(temporary)]);
const mp4 = await save(temporary, "wedding-opening-couple-replacement", "mp4");
const metadata = probe(checked("public" + mp4.src));
const stream = metadata.streams.find(row => row.codec_type === "video");
const bytes = await fs.readFile(checked("public" + mp4.src));
assert.equal(stream.codec_name, "h264");
assert.equal(stream.profile, "Main");
assert.equal(stream.pix_fmt, "yuv420p");
assert.equal(stream.avg_frame_rate, "24/1");
assert.equal(stream.width, 406);
assert.equal(stream.height, 720);
assert.ok(Math.abs(Number(metadata.format.duration) - Number(source.format.duration)) < 0.05, "Full source duration is preserved");
assert.ok(!metadata.streams.some(row => row.codec_type === "audio"));
assert.ok(mp4.bytes < 1500000, "The opening remains lightweight on mobile");
assert.ok(bytes.indexOf(Buffer.from("moov")) >= 0 && bytes.indexOf(Buffer.from("moov")) < bytes.indexOf(Buffer.from("mdat")), "Fast-start metadata precedes video data");
encode(["-i", checked("public" + mp4.src), "-f", "null", "-"]);

const posterTemporary = `${directory}/wedding-opening-replacement.work.webp`;
encode(["-ss", "1", "-i", checked("public" + mp4.src), "-frames:v", "1", "-c:v", "libwebp", "-quality", "78", checked(posterTemporary)]);
const poster = await save(posterTemporary, "wedding-opening-couple-replacement-poster", "webp");
const blur = await sharp(checked("public" + poster.src)).resize({ width: 8 }).webp({ quality: 25 }).toBuffer();
const opening = { ...mp4, sourcePath, description: "Replacement Wedding opening couple film", position: "50% 50%", width: stream.width, height: stream.height, duration: Number(metadata.format.duration), fps: 24, originalBytes: Number(source.format.size), codec: "h264", profile: "Main", level: 31, pixelFormat: "yuv420p", hasAudio: false, fastStart: true, keyframeSeconds: 2, poster: { ...poster, width: stream.width, height: stream.height, blurDataURL: `data:image/webp;base64,${blur.toString("base64")}` } };

// Preserve prior media outside public instead of reusing immutable URLs.
if (previous.src !== opening.src) {
  for (const asset of [previous, previous.webm, previous.poster].filter(Boolean)) {
    const publicFile = "public" + asset.src;
    const archive = `media-sources/wedding/compatible/${path.basename(asset.src)}`;
    await fs.mkdir(checked(path.dirname(archive)), { recursive: true });
    if (!(await exists(checked(archive)))) {
      const oldBytes = await exists(checked(publicFile))
        ? await fs.readFile(checked(publicFile))
        : execFileSync("git", ["show", `HEAD:${publicFile}`], { windowsHide: true, maxBuffer: 10 * 1024 * 1024 });
      await fs.writeFile(checked(archive), oldBytes);
    }
    if (await exists(checked(publicFile))) await fs.unlink(checked(publicFile));
    asset.src = archive;
  }
  const oldEntry = inventory.find(row => row.sourcePath === previous.sourcePath && row.deployed);
  if (oldEntry) Object.assign(oldEntry, previous, { deployed: false, use: "superseded opening; archived outside public" });
}
assets.wedding = opening;
assert.equal(JSON.stringify(assets.homecoming), homecoming, "The Homecoming opening is preserved");
const currentEntry = inventory.find(row => row.sourcePath === sourcePath);
if (currentEntry) Object.assign(currentEntry, opening, { deployed: true, use: "opening" });
else inventory.push({ ...opening, deployed: true, use: "opening" });
await fs.writeFile("src/data/video-assets.json", JSON.stringify(assets, null, 2) + "\n");
await fs.writeFile("media-sources/compatible-video-inventory.json", JSON.stringify(inventory, null, 2) + "\n");
if (await exists(checked(upload))) {
  assert.equal(digest(await fs.readFile(checked(upload))), digest(await fs.readFile(checked(sourcePath))), "The uploaded original is safely archived");
  await fs.unlink(checked(upload));
}
console.log(JSON.stringify({ sourcePath, originalBytes: opening.originalBytes, ...opening }));
