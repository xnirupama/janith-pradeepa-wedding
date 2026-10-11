import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { execFileSync } from "node:child_process";

const clips = JSON.parse(await fs.readFile("media-sources/ambient-placement-assets.json", "utf8"));
const ffmpeg = process.env.FFMPEG_PATH || ".task-tools/ffmpeg/bin/ffmpeg.exe";
const rgb = hex => hex.match(/[a-f\d]{2}/gi).map(v => parseInt(v, 16));
const luminance = color => color.map(v => { const c = v / 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const values = [luminance(a), luminance(b)].sort((x, y) => y - x); return (values[0] + .05) / (values[1] + .05); };
const report = [];
for (const clip of clips) {
  const wedding = clip.event === "wedding";
  const base = rgb(wedding ? "f5eddc" : "3b0715");
  const colors = wedding ? ["392719", "684e1b", "604e39"] : ["fff4df", "e2c58c", "e6cdbd"];
  // Bound every possible frame: solid black for multiply, solid white for
  // screen. Add a conservative 10% ornament/texture influence before video.
  const ornament = rgb(wedding ? "684e1b" : "e2c58c");
  const background = base.map((v, i) => {
    const textured = v * .9 + ornament[i] * .1;
    const blended = wedding ? textured * (1 - clip.opacity) : textured + (255 - textured) * clip.opacity;
    return blended * .5 + v * .5; // minimum scrim alpha .5
  });
  const ratios = colors.map(color => ({ color: "#" + color, ratio: Number(contrast(rgb(color), background).toFixed(2)) }));
  assert.ok(ratios.every(row => row.ratio >= 4.5), `${clip.event}/${clip.section} text contrast`);
  const frames = execFileSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-i", "public" + clip.src, "-vf", "scale=54:96", "-pix_fmt", "gray", "-f", "rawvideo", "-"], { maxBuffer: 8 * 1024 * 1024 });
  const stride = 54 * 96;
  let brightest = 0, peak = -1;
  for (let frame = 0; frame < frames.length / stride; frame++) {
    const average = frames.subarray(frame * stride, (frame + 1) * stride).reduce((sum, v) => sum + v, 0) / stride;
    if (average > peak) { peak = average; brightest = frame; }
  }
  report.push({ event: clip.event, section: clip.section, ratios, minimumRatio: Math.min(...ratios.map(v => v.ratio)), backgroundBound: background.map(Math.round), brightestMeanLumaFrame: brightest, brightestMeanLumaSeconds: brightest / clip.fps, decodedFrames: frames.length / stride, method: "All-frame worst-color bound with minimum scrim and 10% ornament/texture allowance; scan every decoded frame for peak mean luminance" });
}
await fs.writeFile("media-sources/ambient-contrast-verification.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
