import EventExperience from "@/components/EventExperience";
import { getInvitation } from "@/data/invitations";
import { getGalleryImages } from "@/lib/gallery";
import { getShareImage } from "@/lib/assets";

const shareImage = getShareImage("homecoming");

export const metadata = {
  title: "Janith & Pradeepa | Homecoming Celebration",
  description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
  openGraph: {
    title: "Janith & Pradeepa | Homecoming Celebration",
    description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
    type: "website",
    images: [{ url: shareImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Janith & Pradeepa | Homecoming Celebration",
    description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
    images: [shareImage],
  },
};

export default function HomecomingPage() {
  const invitation = getInvitation("homecoming");
  return <EventExperience invitation={invitation} galleryImages={getGalleryImages("homecoming")} />;
}
