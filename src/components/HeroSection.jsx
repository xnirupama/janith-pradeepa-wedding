"use client";

import { useCallback } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import VideoBackdrop from "./VideoBackdrop";

export default function HeroSection({ invitation, active }) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 700], [0, reduceMotion ? 0 : 90]);
  const backgroundY = useTransform(scrollY, [0, 800], [0, reduceMotion ? 0 : 55]);

  const beginStory = useCallback((event) => {
    event.preventDefault();
    const target = document.getElementById("invitation-message");
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", "#invitation-message");
  }, [reduceMotion]);

  return (
    <section className="hero-section" id="top" style={{ "--hero-image": `url(${invitation.backgrounds.hero})` }}>
      <motion.div className="hero-background" style={{ y: backgroundY }} />
      <VideoBackdrop src={invitation.videos.hero} poster={invitation.videoPosters?.hero} fallbackPoster={invitation.backgrounds.hero} active={active} tone={invitation.theme} overlay="none" className="hero-video" />
      <div className="hero-scrim" />
      <div className="heritage-mandala hero-mandala" aria-hidden="true"><span /><i /></div>
      <span className="hero-ornament hero-ornament-left" aria-hidden="true" />
      <span className="hero-ornament hero-ornament-right" aria-hidden="true" />
      <motion.div
        className="hero-content"
        style={{ y: contentY }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0.7, scale: 0.98 }}
        transition={{ duration: 1.4, delay: active ? 0.65 : 0 }}
      >
        <p className="hero-blessing">{invitation.blessing}</p>
        <p className="hero-sinhala" lang="si">{invitation.sinhalaBlessing}</p>
        <span className="fine-rule" aria-hidden="true" />
        <p className="hero-eyebrow">You are invited to</p>
        <p className="hero-event-label">{invitation.eyebrow}</p>
        <h1><span>Janith</span><i>&amp;</i><span>Pradeepa</span></h1>
        <div className="hero-date-medallion" aria-label={invitation.date}>
          <span>{invitation.dateParts.month}</span>
          <strong>{invitation.dateParts.day}</strong>
          <span>{invitation.dateParts.year}</span>
          <small>{invitation.dateParts.weekday}</small>
        </div>
        <a className="scroll-cue" href="#invitation-message" aria-label="Scroll to invitation" onClick={beginStory}>
          <span>Begin our story</span>
          <ChevronDown size={18} />
        </a>
      </motion.div>
    </section>
  );
}
