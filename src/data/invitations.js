import photoAssets from "./photo-assets.json";
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
    videos: {
      opening: "/assets/wedding/videos/wedding-opening-couple.mp4",
      hero: "/assets/wedding/videos/wedding-hero-loop.mp4",
      feature: "/assets/wedding/videos/wedding-floral-loop.mp4",
      closing: "/assets/wedding/videos/wedding-closing-loop.mp4",
    },
    heroPlaybackRate: 0.5,
    sectionVideos: {
      invitation: "/assets/wedding/videos/wedding-floral-frame-loop.mp4",
      feature: "/assets/wedding/videos/wedding-floral-frame-loop.mp4",
      schedule: "/assets/wedding/videos/wedding-soft-light-loop.mp4",
      countdown: "/assets/wedding/videos/wedding-petals-loop.mp4",
      gallery: "/assets/wedding/videos/wedding-floral-frame-loop.mp4",
      location: "/assets/wedding/videos/wedding-soft-light-loop.mp4",
    },
    backgrounds: {
      hero: "/assets/wedding/backgrounds/wedding-hero-bg.jpeg",
      section: "/assets/wedding/backgrounds/wedding-section-bg.jpeg",
    },
    videoPosters: {
      hero: "/assets/wedding/posters/wedding-hero-poster.webp",
      invitation: "/assets/wedding/posters/wedding-invitation-poster.webp",
      feature: "/assets/wedding/posters/wedding-feature-poster.webp",
      schedule: "/assets/wedding/posters/wedding-schedule-poster.webp",
      countdown: "/assets/wedding/posters/wedding-countdown-poster.webp",
      gallery: "/assets/wedding/posters/wedding-gallery-poster.webp",
      location: "/assets/wedding/posters/wedding-location-poster.webp",
      closing: "/assets/wedding/posters/wedding-closing-poster.webp",
    },
    gateArtwork: {
      mandala: "/assets/wedding/decor/wedding-gate-mandala.webp",
      lotus: "/assets/wedding/decor/wedding-gate-lotus.webp",
      procession: "/assets/wedding/decor/wedding-gate-procession.webp",
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
    videos: {
      opening: "/assets/homecoming/videos/homecoming-opening-couple.mp4",
      hero: "/assets/homecoming/videos/homecoming-hero-loop.mp4",
      feature: "/assets/homecoming/videos/homecoming-glow-loop.mp4",
      closing: "/assets/homecoming/videos/homecoming-closing-loop.mp4",
    },
    sectionVideos: {
      invitation: "/assets/homecoming/videos/homecoming-floral-frame-loop.mp4",
      feature: "/assets/homecoming/videos/homecoming-floral-frame-loop.mp4",
      arrival: "/assets/homecoming/videos/homecoming-floral-frame-loop.mp4",
      countdown: "/assets/homecoming/videos/homecoming-countdown-butterfly-loop.mp4",
      gallery: "/assets/homecoming/videos/homecoming-floral-frame-loop.mp4",
      location: "/assets/homecoming/videos/homecoming-petals-loop.mp4",
    },
    backgrounds: {
      hero: "/assets/homecoming/backgrounds/homecoming-hero-bg.jpeg",
      section: "/assets/homecoming/backgrounds/homecoming-section-bg.jpeg",
    },
    videoPosters: {
      hero: "/assets/homecoming/posters/homecoming-hero-poster.webp",
      invitation: "/assets/homecoming/posters/homecoming-invitation-poster.webp",
      feature: "/assets/homecoming/posters/homecoming-feature-poster.webp",
      arrival: "/assets/homecoming/posters/homecoming-arrival-poster.webp",
      countdown: "/assets/homecoming/posters/homecoming-countdown-poster.webp",
      gallery: "/assets/homecoming/posters/homecoming-gallery-poster.webp",
      location: "/assets/homecoming/posters/homecoming-location-poster.webp",
      closing: "/assets/homecoming/posters/homecoming-closing-poster.webp",
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
    videos: { ...localized.videos, openingMobile: videoAssets[slug]?.src },
    videoPosters: { ...localized.videoPosters, opening: videoAssets[slug]?.poster.src ?? photoAssets[slug].backgrounds.hero.src },
  };
}
