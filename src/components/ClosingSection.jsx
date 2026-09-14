"use client";

import { ArrowUp, Heart } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function ClosingSection({ invitation, active }) {
  const backToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <section className="closing-section">
      <VideoBackdrop src={invitation.videos.closing} active={active} className="closing-video" />
      <div className="closing-scrim" />
      <SectionReveal className="closing-content">
        {invitation.closingLead && <p className="closing-lead">{invitation.closingLead}</p>}
        <p className="blessing">{invitation.blessing}</p>
        <p className="sinhala-blessing" lang="si">{invitation.sinhalaBlessing}</p>
        <Heart className="closing-heart" size={17} fill="currentColor" aria-hidden="true" />
        <h2>{invitation.couple}</h2>
        <div className="closing-copy">
          {invitation.closing.map((line) => <p key={line}>{line}</p>)}
        </div>
        <button type="button" className="back-to-top" onClick={backToTop}>
          <ArrowUp size={16} aria-hidden="true" />
          Back to top
        </button>
      </SectionReveal>
    </section>
  );
}
