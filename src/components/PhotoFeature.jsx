"use client";

import SectionReveal from "./SectionReveal";
import { Lotus, SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

export default function PhotoFeature({ invitation }) {
  const { t } = useLanguage();

  return (
    <section className="photo-feature section-shell" id="our-story" aria-labelledby="story-title">
      <SectionReveal className="story-card">
        <SectionHeading id="story-title" kicker={t("storyKicker")} title={t("storyTitle")} />
        <div className="featured-couple-sentiment">
          {invitation.sentiment.map((line) => <p key={line}>{line}</p>)}
        </div>
        <Lotus className="story-lotus" />
        <p className="featured-couple-date">{invitation.displayDate}</p>
      </SectionReveal>
    </section>
  );
}
