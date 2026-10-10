import assert from "node:assert/strict";
import sharp from "sharp";

const origin = (process.argv[2] || "https://janith-pradeepa.vercel.app").replace(/\/$/, "");
for (const event of ["wedding", "homecoming"]) {
  const response = await fetch(`${origin}/${event}?guest=PrivatePreviewCheck`, { headers: { "User-Agent": "facebookexternalhit/1.1" }, signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200);
  const html = await response.text();
  const metadata = new Map([...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, value]));
    return [attributes.property || attributes.name, attributes.content];
  }));
  for (const key of ["og:title", "og:description", "og:image", "og:image:alt", "og:url", "og:type", "og:locale", "twitter:card", "theme-color"]) assert.ok(metadata.get(key), `${event}: missing ${key}`);
  assert.equal(metadata.get("og:url"), `https://janith-pradeepa.vercel.app/${event}`);
  assert.equal(metadata.get("og:locale"), "en_LK");
  assert.equal(metadata.get("twitter:card"), "summary_large_image");
  assert.equal(metadata.get("og:image:width"), "1200"); assert.equal(metadata.get("og:image:height"), "630");
  assert.ok(html.includes(`rel="canonical" href="https://janith-pradeepa.vercel.app/${event}"`));
  assert.ok([...metadata.values()].filter(Boolean).every(value => !value.includes("PrivatePreviewCheck")));
  const image = new URL(metadata.get("og:image"));
  assert.equal(image.origin, "https://janith-pradeepa.vercel.app");
  const raster = await fetch(origin + image.pathname, { signal: AbortSignal.timeout(20000) });
  assert.equal(raster.status, 200); assert.ok(raster.headers.get("content-type")?.startsWith("image/jpeg"));
  const bytes = Buffer.from(await raster.arrayBuffer()); assert.ok(bytes.length < 300000);
  const dimensions = await sharp(bytes).metadata(); assert.deepEqual([dimensions.width, dimensions.height], [1200, 630]);
  console.log(`PASS ${event}: bot-visible metadata, private guest excluded, ${bytes.length}-byte 1200x630 preview`);
}
