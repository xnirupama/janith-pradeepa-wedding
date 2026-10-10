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
import ClosingSection from "./ClosingSection";
import SectionNavigator from "./SectionNavigator";
import { InvitationMotionProvider } from "./InvitationMotion";
import { pauseBackgroundVideos, readMotionEnvironment } from "@/lib/motion-environment";
import { readPreference, savePreference } from "@/lib/preferences";
import MicroInteractions from "./MicroInteractions";

function Experience({ invitation: original, galleryImages, guestName, coupleArtwork }) {
  const { language, t } = useLanguage();
  const invitation = localizeInvitation(original, language);
  const [open, setOpen] = useState(false);
  const [openingFinished, setOpeningFinished] = useState(false);
  const [replaying, setReplaying] = useState(false);
  const [openingDuration, setOpeningDuration] = useState(2500);
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
  const openInvitation = () => {
    pauseBackgroundVideos();
    const audio = document.getElementById("invitation-music");
    if (audio && readPreference("music-muted") !== "true") { audio.volume = 0; audio.play().catch(() => {}); }
    setOpeningDuration(readMotionEnvironment().reducedMotion ? 400 : readPreference("opening-seen") === "true" ? 900 : 2500);
    setOpen(true);
  };
  const finishOpening = useCallback(() => { savePreference("opening-seen", true); setOpeningFinished(true); }, []);
  const replayOpening = () => { savedScroll.current = window.scrollY; pauseBackgroundVideos(); setOpeningDuration(readMotionEnvironment().reducedMotion ? 400 : 2500); setReplaying(true); };
  const finishReplay = useCallback(() => {
    setReplaying(false);
    requestAnimationFrame(() => window.scrollTo({ top: savedScroll.current, behavior: "instant" }));
  }, []);
  return <InvitationMotionProvider suspended={replaying}><main className={"event-page theme-" + original.theme + (contentActive ? " has-section-nav" : "")} style={invitationThemes[original.theme]} lang={language}>
    <MicroInteractions active={contentActive} />
    <LanguageToggle floating />
    <InvitationGate invitation={invitation} guestName={guestName} open={open} onOpen={openInvitation} />
    {((open && !openingFinished) || replaying) && <OpeningFilm invitation={invitation} duration={openingDuration} onComplete={replaying ? finishReplay : finishOpening} />}
    <MusicController src={original.music} invitationOpen={open} controlsVisible={contentActive && !replaying} />
    {open && <>
      <div className="invitation-content" inert={!contentActive || replaying}>
        {contentActive && <FloatingAtmosphere />}
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
        <ClosingSection invitation={invitation} active onReplayOpening={replayOpening} />
      </div>
      {contentActive && !replaying && <SectionNavigator invitation={invitation} />}
    </>}
  </main></InvitationMotionProvider>;
}
export default function EventExperience({ initialLanguage = "en", ...props }) {
  return <InvitationLanguageProvider initialLanguage={initialLanguage}><Experience {...props} /></InvitationLanguageProvider>;
}
