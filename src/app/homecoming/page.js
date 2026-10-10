import { invitationMetadata } from "@/lib/invitation-metadata";
import EventExperience from "@/components/EventExperience";
import { getInvitation } from "@/data/invitations";
import { getCoupleArtwork, getGalleryImages } from "@/lib/gallery";
import { sanitizeGuestName } from "@/lib/personalization";
import { cookies } from "next/headers";

export const metadata = invitationMetadata("homecoming");

export const viewport = {
  themeColor: "#3b0715",
  colorScheme: "dark",
};

export default async function HomecomingPage({ searchParams }) {
  const invitation = getInvitation("homecoming");
  const [params, cookieStore] = await Promise.all([searchParams, cookies()]);
  const initialLanguage = cookieStore.get("invitation-language")?.value === "si" ? "si" : "en";
  return <EventExperience invitation={invitation} initialLanguage={initialLanguage} galleryImages={await getGalleryImages("homecoming")} coupleArtwork={getCoupleArtwork("homecoming")} guestName={sanitizeGuestName(params?.guest ?? params?.to)} />;
}
