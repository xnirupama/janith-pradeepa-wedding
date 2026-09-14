"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import InvitationGate from "./InvitationGate";
import OpeningFilm from "./OpeningFilm";
import MusicController from "./MusicController";
import FloatingAtmosphere from "./FloatingAtmosphere";
import HeroSection from "./HeroSection";
import SectionReveal from "./SectionReveal";
import PhotoFeature from "./PhotoFeature";
import EventSchedule from "./EventSchedule";
import Countdown from "./Countdown";
import Gallery from "./Gallery";
import VideoBackdrop from "./VideoBackdrop";
import LocationSection from "./LocationSection";
import AddToCalendar from "./AddToCalendar";
import RSVPForm from "./RSVPForm";
import ClosingSection from "./ClosingSection";
import SectionNavigator from "./SectionNavigator";

function InvitationMessage({ invitation, active }) {
  return (
    <section className="invitation-message cinematic-section section-shell" id="invitation-message">
      <VideoBackdrop src={invitation.sectionVideos.invitation} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.invitation} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="section-heading message-heading">
        <div className="heritage-section-emblem" aria-hidden="true"><Sparkles size={17} /></div>
        <p className="section-kicker">Together with joyful hearts</p>
        {invitation.intro.map((line) => <p key={line}>{line}</p>)}
        <h2>{invitation.displayDate}</h2>
        <span className="ornament"><i /><Heart size={13} fill="currentColor" /><i /></span>
        <div className="sentiment">
          {invitation.sentiment.map((line) => <p key={line}>{line}</p>)}
        </div>
        {invitation.presence && <p className="presence">{invitation.presence}</p>}
        <AddToCalendar calendar={invitation.calendar} eventSlug={invitation.slug} />
      </SectionReveal>
    </section>
  );
}

function Arrival({ arrival, invitation, active }) {
  if (!arrival) return null;
  return (
    <section className="arrival-section cinematic-section section-shell" id="event-details">
      <VideoBackdrop src={invitation.sectionVideos.arrival} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.arrival} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="arrival-card">
        <div className="heritage-card-crown" aria-hidden="true" />
        <p className="section-kicker">A joyful welcome</p>
        <h2>{arrival.title}</h2>
        <div className="arrival-time-ring" aria-label={`Arrival time ${arrival.time}`}>
          <span aria-hidden="true" />
          <strong>{arrival.time}</strong>
          <i aria-hidden="true" />
        </div>
        <p>{arrival.text}</p>
      </SectionReveal>
    </section>
  );
}

function Celebration({ invitation, active }) {
  return (
    <section className="celebration-section cinematic-section" style={{ "--section-image": `url(${invitation.backgrounds.section})` }}>
      <VideoBackdrop src={invitation.videos.feature} poster={invitation.videoPosters?.feature} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="none" className="feature-video" />
      <div className="celebration-scrim" />
      <SectionReveal className="celebration-content">
        <div className="heritage-section-emblem heritage-section-emblem-light" aria-hidden="true"><Heart size={15} fill="currentColor" /></div>
        <p className="section-kicker">Together is a beautiful place to be</p>
        <h2>Celebrate With Us</h2>
        {invitation.celebration.map((line) => <p key={line}>{line}</p>)}
      </SectionReveal>
    </section>
  );
}

export default function EventExperience({ invitation, galleryImages }) {
  const [open, setOpen] = useState(false);
  const [openingFinished, setOpeningFinished] = useState(false);
  const pendingHashRef = useRef("");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (["top", "our-story", "event-details", "location", "rsvp"].includes(hash)) {
      pendingHashRef.current = hash;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const openInvitation = useCallback(() => {
    const audio = document.getElementById("invitation-music");
    if (audio) {
      audio.volume = 0;
      audio.play().catch(() => {});
    }
    setOpen(true);
    setOpeningFinished(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const finishOpening = useCallback(() => setOpeningFinished(true), []);
  const contentActive = open && openingFinished;

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    if (!contentActive) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [contentActive]);

  useEffect(() => {
    if (!contentActive || !pendingHashRef.current) return;
    const targetId = pendingHashRef.current;
    pendingHashRef.current = "";
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [contentActive]);

  return (
    <main className={`event-page theme-${invitation.theme} ${contentActive ? "has-section-nav" : ""}`}>
      <InvitationGate invitation={invitation} open={open} onOpen={openInvitation} />
      <OpeningFilm invitation={invitation} visible={open && !openingFinished} onComplete={finishOpening} />
      <MusicController src={invitation.music} invitationOpen={open} />
      <FloatingAtmosphere />
      {contentActive && <SectionNavigator invitation={invitation} />}
      <HeroSection invitation={invitation} active={contentActive} />
      <InvitationMessage invitation={invitation} active={contentActive} />
      <PhotoFeature invitation={invitation} active={contentActive} />
      {invitation.schedule && <EventSchedule items={invitation.schedule} invitation={invitation} active={contentActive} />}
      <Arrival arrival={invitation.arrival} invitation={invitation} active={contentActive} />
      <Countdown invitation={invitation} active={contentActive} />
      <Gallery images={galleryImages} invitation={invitation} contentActive={contentActive} />
      <Celebration invitation={invitation} active={contentActive} />
      <LocationSection location={invitation.location} invitation={invitation} active={contentActive} />
      <RSVPForm invitation={invitation} active={contentActive} />
      <ClosingSection invitation={invitation} active={contentActive} />
    </main>
  );
}
