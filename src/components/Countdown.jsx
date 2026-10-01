"use client";

import { useEffect, useRef, useState } from "react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

const ZERO = { days: 0, hours: 0, minutes: 0, seconds: 0, complete: false };

function calculate(target) {
  const distance = new Date(target).getTime() - Date.now();
  if (distance <= 0) return { ...ZERO, complete: true };
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    complete: false,
  };
}

function FlipCard({ value, label }) {
  const padded = String(value).padStart(2, "0");
  const prevRef = useRef(padded);
  const [flipping, setFlipping] = useState(false);
  const [displayPrev, setDisplayPrev] = useState(padded);
  const [displayNext, setDisplayNext] = useState(padded);

  useEffect(() => {
    if (padded === prevRef.current) return;
    const prev = prevRef.current;
    prevRef.current = padded;
    setDisplayPrev(prev);
    setDisplayNext(padded);
    setFlipping(false);
    // Tiny rAF pause so state flushes before CSS class triggers transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipping(true));
    });
  }, [padded]);

  return (
    <div className="countdown-card" role="timer">
      <div className={`flip-container ${flipping ? "is-flipping" : ""}`} aria-label={`${value} ${label}`}>
        {/* Static back face (new value, revealed after flip) */}
        <div className="flip-back" aria-hidden="true">
          <div className="flip-half flip-back-top"><span>{displayNext}</span></div>
          <div className="flip-half flip-back-bottom"><span>{displayNext}</span></div>
        </div>
        {/* Front face top (old value - folds away) */}
        <div className={`flip-half flip-front-top ${flipping ? "fold-top" : ""}`} aria-hidden="true">
          <span>{displayPrev}</span>
        </div>
        {/* Static front bottom (old value, stays) */}
        <div className="flip-half flip-front-bottom" aria-hidden="true">
          <span>{displayPrev}</span>
        </div>
      </div>
      <span className="countdown-label">{label}</span>
    </div>
  );
}

export default function Countdown({ invitation, active }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const update = () => setRemaining(calculate(invitation.countdownTarget));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [invitation.countdownTarget]);

  const units = [
    ["days", "DAYS"],
    ["hours", "HRS"],
    ["minutes", "MIN"],
    ["seconds", "SEC"],
  ];

  return (
    <section className="countdown-section cinematic-section section-shell" aria-labelledby="countdown-title">
      <VideoBackdrop src={invitation.sectionVideos.countdown} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.countdown} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="section-heading">
        <p className="section-kicker">A moment worth waiting for</p>
        <h2 id="countdown-title">{invitation.countdownHeading}</h2>
        <p>{invitation.countdownText}</p>
      </SectionReveal>
      <SectionReveal className="countdown-grid" aria-live="polite" aria-atomic="true">
        {units.map(([key, label]) => (
          <FlipCard key={key} value={remaining ? remaining[key] : 0} label={label} />
        ))}
      </SectionReveal>
      {remaining?.complete && <p className="countdown-complete">{invitation.countdownComplete}</p>}
    </section>
  );
}
