"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CarFront, FileSignature, Gem } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function EventSchedule({ items, invitation, active }) {
  const reduceMotion = useReducedMotion();
  const icons = [Gem, FileSignature, CarFront];

  return (
    <section className="schedule-section cinematic-section section-shell" id="event-details" aria-labelledby="schedule-title">
      <VideoBackdrop src={invitation.sectionVideos.schedule} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.schedule} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="section-heading">
        <p className="section-kicker">The day unfolds</p>
        <h2 id="schedule-title">Wedding Day</h2>
        <span className="heading-flourish" aria-hidden="true" />
      </SectionReveal>
      <div className="timeline">
        <motion.span
          className="timeline-draw"
          aria-hidden="true"
          initial={reduceMotion ? false : { scaleY: 0 }}
          whileInView={reduceMotion ? undefined : { scaleY: 1 }}
          viewport={{ once: true, amount: .2 }}
          transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }}
        />
        {items.map((item, index) => {
          const Icon = icons[index] || Gem;
          return (
            <SectionReveal key={item.title} className="timeline-item" delay={index * 0.1}>
              <span className="timeline-icon" aria-hidden="true"><Icon size={18} strokeWidth={1.55} /></span>
              <div className="timeline-copy"><h3>{item.title}</h3></div>
              <time>{item.time}</time>
            </SectionReveal>
          );
        })}
      </div>
    </section>
  );
}
