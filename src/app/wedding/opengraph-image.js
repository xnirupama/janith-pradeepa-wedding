import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import SocialInvitationImage from "@/components/SocialInvitationImage";

export const alt = "Janith and Pradeepa wedding invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const sinhalaBlessingImage = readFile(
  path.join(process.cwd(), "src", "components", "sinhala-blessing.png"),
);

export default async function Image() {
  const sinhalaImage = new Uint8Array(await sinhalaBlessingImage).buffer;
  return new ImageResponse(
    <SocialInvitationImage
      theme="wedding"
      blessing="SRI SUBHA MANGALAM!"
      sinhalaBlessing="ශ්‍රී සුභ මංගලම්!"
      sinhalaImage={sinhalaImage}
      label="The Wedding"
      date="Thursday, 26 November 2026"
      location="Hemandra Grand Hotel"
    />,
    size,
  );
}
