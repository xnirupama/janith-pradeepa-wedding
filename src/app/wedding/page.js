import EventExperience from "@/components/EventExperience";
import { getInvitation } from "@/data/invitations";
import { getGalleryImages } from "@/lib/gallery";
import { getShareImage } from "@/lib/assets";

const shareImage = getShareImage("wedding");

export const metadata = {
  title: "Janith & Pradeepa | Wedding Invitation",
  description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
  openGraph: {
    title: "Janith & Pradeepa | Wedding Invitation",
    description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
    type: "website",
    images: [{ url: shareImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Janith & Pradeepa | Wedding Invitation",
    description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
    images: [shareImage],
  },
};

export default function WeddingPage() {
  const invitation = getInvitation("wedding");
  return <EventExperience invitation={invitation} galleryImages={getGalleryImages("wedding")} />;
}
