"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function PhotoFeature({ invitation, active }) {
  const [failed, setFailed] = useState(false);

  return (
    <section className="photo-feature cinematic-section section-shell">
      <VideoBackdrop src={invitation.sectionVideos.photo} poster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" position="center" opacity={.72} />
      <SectionReveal className="photo-frame-wrap">
        <span className="portrait-fan portrait-fan-left" aria-hidden="true" />
        <span className="portrait-fan portrait-fan-right" aria-hidden="true" />
        <div className={`photo-frame ${failed ? "photo-placeholder" : ""}`}>
          {!failed && (
            <Image
              src={invitation.heroPhoto}
              alt="Janith and Pradeepa"
              fill
              sizes="(max-width: 700px) 86vw, 580px"
              onError={() => setFailed(true)}
              priority={false}
            />
          )}
          {failed && (
            <div className="placeholder-mark" aria-label="Couple photograph placeholder">
              <Heart size={28} fill="currentColor" />
              <span>A beautiful memory belongs here</span>
            </div>
          )}
        </div>
        <div className="photo-caption">
          <span>J</span><i>&</i><span>P</span>
        </div>
      </SectionReveal>
    </section>
  );
}
