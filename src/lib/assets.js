import fs from "node:fs";
import path from "node:path";

export function getShareImage(event) {
  const expected = path.join(process.cwd(), "public", "assets", event, "share", `${event}-og.jpg`);
  return fs.existsSync(expected) ? `/assets/${event}/share/${event}-og.jpg` : "/assets/shared/placeholders/share-fallback.svg";
}
