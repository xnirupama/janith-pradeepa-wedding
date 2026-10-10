import brand from "@/data/brand-assets.json";

const origin = "https://janith-pradeepa.vercel.app";
export function invitationMetadata(event) {
  const wedding = event === "wedding";
  const label = wedding ? "Wedding Invitation" : "Homecoming Celebration";
  const title = `Janith & Pradeepa | ${label}`;
  const description = wedding ? "Join Janith & Pradeepa as they celebrate their wedding on Thursday, 26 November 2026." : "Join Janith & Pradeepa for their Homecoming Celebration on Monday, 30 November 2026.";
  const url = `${origin}/${event}`, assets = brand[event];
  const image = { url: origin + assets.wide.src, width: 1200, height: 630, alt: `Janith and Pradeepa - ${label}, November 2026` };
  return { title, description, alternates: { canonical: url }, openGraph: { title, description, url, type: "website", locale: "en_LK", images: [image] }, twitter: { card: "summary_large_image", title, description, images: [image.url] }, icons: { icon: [{ url: assets.icon.src, type: "image/svg+xml", sizes: "any" }, { url: assets.ico.src, type: "image/x-icon", sizes: "32x32" }], apple: [{ url: assets.apple.src, sizes: "180x180", type: "image/png" }] }, manifest: assets.manifest.src };
}
