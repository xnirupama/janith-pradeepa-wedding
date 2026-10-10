"use client";

import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";
import { Lotus, MandalaLayers } from "./InvitationOrnaments";
import VideoBackdrop from "./VideoBackdrop";

export default function HeroSection({ invitation, guestName, coupleArtwork }) {
  const { t } = useLanguage();
  const { weekday, day, month, year } = invitation.dateParts;
  const time = invitation.schedule?.[0].time ?? invitation.arrival.time;
  return (
    <section className="hero-section" id="top" aria-labelledby="hero-names">
      <VideoBackdrop clip={invitation.motionVideos.hero} className="hero-backdrop" />
      <MandalaLayers className="hero-mandalas" />
      <div className="hero-content">
        <p className="hero-eyebrow">{t("heroInvitation")}</p>
        {guestName && <p className="guest-line">{t("dearGuest", { guest: guestName })}</p>}
        <p className="section-kicker">{invitation.eyebrow}</p>
        <h1 id="hero-names" className="hero-names"><span>Janith</span><i>&amp;</i><span>Pradeepa</span></h1>
        <p className="hero-full-names">{invitation.groom}<span>&amp;</span>{invitation.bride}</p>
        <div className="hero-date-block" aria-label={invitation.date + ", " + time}>
          <span className="hero-year">{year}</span>
          <div className="hero-date-row"><span>{month}</span><strong>{day}</strong><span>{weekday}</span></div>
          <time dateTime={invitation.countdownTarget}>{time}</time>
        </div>
        {coupleArtwork && <div className="hero-couple-art"><Image src={coupleArtwork.src} alt={t("photoAlt")} width={coupleArtwork.width} height={coupleArtwork.height} sizes="(max-width: 480px) 68vw, 300px" placeholder="blur" blurDataURL={coupleArtwork.blurDataURL} loading="lazy" /></div>}
        <Lotus />
        <a className="scroll-cue" href="#invitation-message"><span>{t("storyCue")}</span><ChevronDown size={18} aria-hidden="true" /></a>
      </div>
    </section>
  );
}
