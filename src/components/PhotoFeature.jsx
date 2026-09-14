"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function PhotoFeature({ invitation, active }) {
  const [failed, setFailed] = useState(false);
  const featurePhoto = invitation.featurePhoto || invitation.heroPhoto;

  return (
    <section className="photo-feature cinematic-section section-shell" id="our-story">
      <VideoBackdrop src={invitation.sectionVideos.feature} fallbackSrc={invitation.videos.feature} poster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" position="center" opacity={.78} />
      <SectionReveal className="featured-couple-layout">
        <div className="featured-couple-copy">
          <p className="section-kicker">A portrait of our story</p>
          <h2>Together, Always</h2>
          <div className="featured-couple-sentiment">
            {invitation.sentiment.map((line) => <p key={line}>{line}</p>)}
          </div>
          <span className="featured-couple-rule" aria-hidden="true"><i /><Heart size={12} fill="currentColor" /><i /></span>
          <p className="featured-couple-date">{invitation.displayDate}</p>
        </div>
        <div className="photo-frame-wrap">
          <span className="portrait-fan portrait-fan-left" aria-hidden="true" />
          <span className="portrait-fan portrait-fan-right" aria-hidden="true" />
          <div className={`photo-frame ${failed ? "photo-placeholder" : ""}`}>
            {!failed && (
              <Image
                src={featurePhoto}
                alt="Janith and Pradeepa"
                fill
                sizes="(max-width: 719px) 88vw, 520px"
                onError={() => setFailed(true)}
                loading="lazy"
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
            <span>J</span><i>&amp;</i><span>P</span>
          </div>
        </div>
      </SectionReveal>
    </section>
  );
}
