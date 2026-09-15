import EventExperience from "@/components/EventExperience";
import { getInvitation } from "@/data/invitations";
import { getGalleryImages } from "@/lib/gallery";
import { sanitizeGuestName } from "@/lib/personalization";

export const metadata = {
  title: "Janith & Pradeepa | Homecoming Celebration",
  description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
  openGraph: {
    title: "Janith & Pradeepa | Homecoming Celebration",
    description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Janith & Pradeepa | Homecoming Celebration",
    description: "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.",
  },
};

export const viewport = {
  themeColor: "#3b0715",
  colorScheme: "dark",
};

export default async function HomecomingPage({ searchParams }) {
  const invitation = getInvitation("homecoming");
  const params = await searchParams;
  return <EventExperience invitation={invitation} galleryImages={getGalleryImages("homecoming")} guestName={sanitizeGuestName(params?.to)} />;
}
