import backgroundVideos from "./background-videos.json";
import videoAssets from "./video-assets.json";
import { applyInvitationCopy, translations } from "./translations";

const shared = {
  couple: "Janith & Pradeepa",
  groom: "Janith Madushanka",
  bride: "Pradeepa Kumari",
  blessing: "SRI SUBHA MANGALAM!",
  sinhalaBlessing: "ශ්‍රී සුභ මංගලම්!",
};

export const invitations = {
  wedding: {
    ...shared,
    slug: "wedding",
    theme: "wedding",
    dateParts: { day: "26", year: "2026" },
    countdownTarget: "2026-11-26T09:16:00+05:30",
    schedule: [
      { time: "9:16 AM" },
      { time: "10:10 AM" },
      { time: "4:08 PM" },
    ],
    heroPhoto: "/assets/wedding/photos/wedding-hero.jpg",
    featurePhoto: "/assets/wedding/photos/wedding-couple-feature.jpeg",
    stickerPhoto: "/assets/wedding/photos/wedding-couple-feature.png",
    music: "/assets/wedding/music/wedding-theme.mp3",
    backgrounds: {
      hero: "/assets/wedding/backgrounds/wedding-hero-bg.jpeg",
      section: "/assets/wedding/backgrounds/wedding-section-bg.jpeg",
    },
    location: {
      enabled: true,
      name: "Hemandra Grand Hotel",
      address: "",
      addressLines: [],
      mapsUrl: "https://maps.app.goo.gl/urnjWCBNcUmjTYrZ7",
      contact: { phone: "+94775339705", display: "077 533 9705" },
    },
    calendar: {
      allDay: false,
      start: "20261126T091600",
      end: "20261126T160800",
      title: "The Wedding of Janith & Pradeepa",
      description: "Poruwa Ceremony at 9:16 AM, Registration at 10:10 AM, and Departure of the Newlyweds at 4:08 PM.",
      location: "Hemandra Grand Hotel",
    },
  },
  homecoming: {
    ...shared,
    slug: "homecoming",
    theme: "homecoming",
    dateParts: { day: "30", year: "2026" },
    countdownTarget: "2026-11-30T11:08:00+05:30",
    arrival: {
      time: "11:08 AM",
    },
    heroPhoto: "/assets/homecoming/photos/homecoming-hero.jpg",
    featurePhoto: "/assets/homecoming/photos/homecoming-couple-feature.jpeg",
    stickerPhoto: "/assets/homecoming/photos/homecoming-couple-feature.png",
    music: "/assets/homecoming/music/homecoming-theme.mp3",
    backgrounds: {
      hero: "/assets/homecoming/backgrounds/homecoming-hero-bg.jpeg",
      section: "/assets/homecoming/backgrounds/homecoming-section-bg.jpeg",
    },
    location: {
      enabled: true,
      name: "Senwin Mandeer",
      address: "Thalgaswala",
      addressLines: ["Thalgaswala"],
      mapsUrl: "https://share.google/yjhuVkqNNSOrz0HFx",
      contact: { phone: "+94705525625", display: "0705 525 625" },
    },
    calendar: {
      allDay: true,
      startDate: "20261130",
      endDate: "20261201",
      title: "Janith & Pradeepa — Homecoming Celebration",
      description: "Arrival of the Newlyweds — 11:08 AM. The celebration continues throughout the day and into the evening.",
      location: "Senwin Mandeer, Thalgaswala",
    },
  },
};

export function getInvitation(slug) {
  const invitation = invitations[slug];
  if (!invitation) return undefined;
  const localized = applyInvitationCopy(invitation, translations.en.invitationCopy[slug]);
  return {
    ...localized,
    videos: { opening: videoAssets[slug].src },
    motionVideos: backgroundVideos[slug],
    videoPosters: { opening: videoAssets[slug].poster.src },
  };
}
