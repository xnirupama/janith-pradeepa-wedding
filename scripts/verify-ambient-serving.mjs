import assert from "node:assert/strict";
import fs from "node:fs/promises";

const origin = process.env.INVITATION_TEST_URL || "https://janith-pradeepa.vercel.app";
const assets = JSON.parse(await fs.readFile("media-sources/ambient-placement-assets.json", "utf8"));
const results = [];
for (const event of ["wedding", "homecoming"]) {
  const response = await fetch(`${origin}/${event}?ambient-check=7471b90`);
  const html = await response.text();
  const current = assets.filter(clip => clip.event === event).every(clip => html.includes(clip.src));
  console.log(event, response.status, current ? "current deployment" : "deployment pending");
  assert.equal(response.status, 200); assert.ok(current, "Current clips are missing from the live route");
}
for (const clip of assets) for (const [src, bytes, type] of [[clip.src, clip.bytes, "video/mp4"], [clip.poster.src, clip.poster.bytes, "image/webp"]]) {
  const response = await fetch(origin + src, { headers: { Range: "bytes=0-1023" } });
  const body = await response.arrayBuffer();
  const result = { src, status: response.status, type: response.headers.get("content-type"), cache: response.headers.get("cache-control"), range: response.headers.get("content-range"), receivedBytes: body.byteLength, fileBytes: bytes };
  assert.equal(result.status, 206); assert.equal(result.type, type); assert.equal(result.receivedBytes, 1024);
  assert.equal(result.range, `bytes 0-1023/${bytes}`); assert.ok(result.cache.includes("max-age=31536000") && result.cache.includes("immutable"));
  results.push(result); console.log("PASS", src);
}
await fs.mkdir("artifacts/qa", { recursive: true });
await fs.writeFile("artifacts/qa/ambient-live-serving.json", JSON.stringify({ origin, checkedAt: new Date().toISOString(), results }, null, 2) + "\n");
