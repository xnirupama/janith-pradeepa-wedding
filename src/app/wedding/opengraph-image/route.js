import { readFile } from "node:fs/promises";
import path from "node:path";
import brand from "@/data/brand-assets.json";
export const dynamic = "force-static";
export async function GET() {
  return new Response(await readFile(path.join(process.cwd(), "public", brand.wedding.wide.src)), { headers: { "Content-Type": "image/jpeg" } });
}
