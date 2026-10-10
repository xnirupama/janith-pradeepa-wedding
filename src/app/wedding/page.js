import EventExperience from "@/components/EventExperience";
import { getInvitation } from "@/data/invitations";
import { getCoupleArtwork, getGalleryImages } from "@/lib/gallery";
import { sanitizeGuestName } from "@/lib/personalization";
import { cookies } from "next/headers";

export const metadata = {
  title: "Janith & Pradeepa | Wedding Invitation",
  description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
  openGraph: {
    title: "Janith & Pradeepa | Wedding Invitation",
    description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Janith & Pradeepa | Wedding Invitation",
    description: "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026.",
  },
};

export const viewport = {
  themeColor: "#f5eddc",
  colorScheme: "light",
};

export default async function WeddingPage({ searchParams }) {
  const invitation = getInvitation("wedding");
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const initialLanguage = cookieStore.get("invitation-language")?.value === "si" ? "si" : "en";
  return <EventExperience invitation={invitation} initialLanguage={initialLanguage} galleryImages={await getGalleryImages("wedding")} coupleArtwork={getCoupleArtwork("wedding")} guestName={sanitizeGuestName(params?.guest ?? params?.to)} />;
}
