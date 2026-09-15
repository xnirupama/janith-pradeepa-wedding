import { ImageResponse } from "next/og";
import SocialInvitationImage from "@/components/SocialInvitationImage";

export const alt = "Janith and Pradeepa homecoming invitation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <SocialInvitationImage
      theme="homecoming"
      label="Homecoming Celebration"
      date="Monday, 30 November 2026"
      location="At the house in Pitigala"
    />,
    size,
  );
}
