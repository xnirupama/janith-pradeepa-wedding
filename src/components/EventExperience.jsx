"use client";

import { useCallback, useState } from "react";
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

function InvitationMessage({ invitation }) {
  return (
    <section className="invitation-message section-shell">
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

function Arrival({ arrival }) {
  if (!arrival) return null;
  return (
    <section className="arrival-section section-shell">
      <SectionReveal className="arrival-card">
        <div className="heritage-card-crown" aria-hidden="true" />
        <p className="section-kicker">A joyful welcome</p>
        <h2>{arrival.title}</h2>
        <strong>{arrival.time}</strong>
        <p>{arrival.text}</p>
      </SectionReveal>
    </section>
  );
}

function Celebration({ invitation, active }) {
  return (
    <section className="celebration-section" style={{ "--section-image": `url(${invitation.backgrounds.section})` }}>
      <VideoBackdrop src={invitation.videos.feature} active={active} className="feature-video" />
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

  const openInvitation = useCallback(() => {
    const audio = document.getElementById("invitation-music");
    if (audio) {
      audio.volume = 0.35;
      audio.play().catch(() => {});
    }
    setOpen(true);
    setOpeningFinished(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const finishOpening = useCallback(() => setOpeningFinished(true), []);

  return (
    <main className={`event-page theme-${invitation.theme}`}>
      <InvitationGate invitation={invitation} open={open} onOpen={openInvitation} />
      <OpeningFilm invitation={invitation} visible={open && !openingFinished} onComplete={finishOpening} />
      <MusicController src={invitation.music} invitationOpen={open} />
      <FloatingAtmosphere />
      <HeroSection invitation={invitation} active={open && openingFinished} />
      <InvitationMessage invitation={invitation} />
      <PhotoFeature invitation={invitation} />
      {invitation.schedule && <EventSchedule items={invitation.schedule} />}
      <Arrival arrival={invitation.arrival} />
      <Countdown invitation={invitation} />
      <Gallery images={galleryImages} />
      <Celebration invitation={invitation} active={open && openingFinished} />
      <LocationSection location={invitation.location} />
      <RSVPForm invitation={invitation} />
      <ClosingSection invitation={invitation} active={open && openingFinished} />
    </main>
  );
}
