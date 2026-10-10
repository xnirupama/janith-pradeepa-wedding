"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { localizeInvitation } from "@/data/translations";
import { invitationThemes } from "@/data/themes";
import { InvitationLanguageProvider, LanguageToggle, useLanguage } from "./InvitationLanguage";
import { Lotus, SectionHeading } from "./InvitationOrnaments";
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
import LocationSection from "./LocationSection";
import RSVPForm from "./RSVPForm";
import GuestExtras from "./GuestExtras";
import ClosingSection from "./ClosingSection";
import SectionNavigator from "./SectionNavigator";

function Experience({ invitation: original, galleryImages, guestName, coupleArtwork }) {
  const { language, t } = useLanguage();
  const invitation = localizeInvitation(original, language);
  const [open, setOpen] = useState(false);
  const [openingFinished, setOpeningFinished] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const openingVideoRef = useRef(null);
  const pendingHash = useRef("");
  const savedScroll = useRef(0);
  const contentActive = open && openingFinished;
  useEffect(() => {
    pendingHash.current = window.location.hash.slice(1);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    const previous = document.body.style.overflow;
    if (!contentActive || replaying) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [contentActive, replaying]);
  useEffect(() => {
    if (!contentActive || !pendingHash.current) return;
    const id = pendingHash.current;
    pendingHash.current = "";
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: "instant" }));
    return () => cancelAnimationFrame(frame);
  }, [contentActive]);
  const playOpening = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const video = openingVideoRef.current;
    if (!video) return;
    if (!video.getAttribute("src")) {
      video.src = video.dataset.openingSrc;
      video.poster = video.dataset.openingPoster;
      video.load();
    }
    video.currentTime = 0;
    video.play().catch(() => {});
  };
  const openInvitation = () => {
    const audio = document.getElementById("invitation-music");
    if (audio) { audio.volume = 0; audio.play().catch(() => {}); }
    playOpening();
    setOpen(true);
  };
  const finishOpening = useCallback(() => setOpeningFinished(true), []);
  const replayOpening = () => { savedScroll.current = window.scrollY; playOpening(); setReplaying(true); };
  const finishReplay = useCallback(() => {
    setReplaying(false);
    requestAnimationFrame(() => window.scrollTo({ top: savedScroll.current, behavior: "instant" }));
  }, []);
  return <main className={"event-page theme-" + original.theme + (contentActive ? " has-section-nav" : "")} style={invitationThemes[original.theme]} lang={language}>
    <LanguageToggle floating />
    <InvitationGate invitation={invitation} guestName={guestName} open={open} onOpen={openInvitation} />
    <OpeningFilm ref={openingVideoRef} invitation={invitation} visible={(open && !openingFinished) || replaying} onComplete={replaying ? finishReplay : finishOpening} />
    <MusicController src={original.music} invitationOpen={open} controlsVisible={contentActive && !replaying} />
    {contentActive && <>
      <div className="invitation-content" inert={replaying}>
        <FloatingAtmosphere />
        <HeroSection invitation={invitation} guestName={guestName} coupleArtwork={coupleArtwork} />
        <section className="invitation-message section-shell" id="invitation-message">
          <SectionReveal className="message-card"><p className="section-kicker">{t("invitationKicker")}</p>{invitation.intro.map(line => <p key={line}>{line}</p>)}<Lotus /><div className="sentiment">{invitation.sentiment.map(line => <p key={line}>{line}</p>)}</div>{invitation.presence && <p>{invitation.presence}</p>}</SectionReveal>
        </section>
        <EventSchedule invitation={invitation} active />
        <Countdown invitation={invitation} active />
        <PhotoFeature invitation={invitation} active />
        <Gallery images={galleryImages} invitation={invitation} contentActive />
        <section className="celebration-section section-shell"><SectionReveal><SectionHeading kicker={t("celebrationKicker")} title={t("celebrationTitle")} />{invitation.celebration.map(line => <p key={line}>{line}</p>)}</SectionReveal></section>
        <LocationSection location={invitation.location} invitation={invitation} active />
        <RSVPForm invitation={invitation} eventSlug={original.slug} guestName={guestName} />
        <GuestExtras invitation={invitation} />
        <ClosingSection invitation={invitation} active onReplayOpening={replayOpening} />
      </div>
      {!replaying && <SectionNavigator invitation={invitation} />}
    </>}
  </main>;
}
export default function EventExperience({ initialLanguage = "en", ...props }) {
  return <InvitationLanguageProvider initialLanguage={initialLanguage}><Experience {...props} /></InvitationLanguageProvider>;
}
