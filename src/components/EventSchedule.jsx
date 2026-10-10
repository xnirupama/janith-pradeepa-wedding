"use client";

import { CarFront, FileSignature, Gem } from "lucide-react";
import SectionReveal from "./SectionReveal";
import AddToCalendar from "./AddToCalendar";
import { SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

export default function EventSchedule({ items, invitation }) {
  const { t } = useLanguage();
  const events = items || invitation.schedule || (invitation.arrival ? [invitation.arrival] : []);
  const icons = invitation.arrival ? [CarFront] : [Gem, FileSignature, CarFront];

  return (
    <section className="schedule-section section-shell" id="event-details" aria-labelledby="schedule-title">
      <SectionReveal>
        <SectionHeading kicker={t("scheduleKicker")} title={t(invitation.arrival ? "homecomingDay" : "weddingDay")} id="schedule-title" />
      </SectionReveal>
      <div className={"arch-card-grid" + (events.length === 1 ? " arch-card-grid--single" : "")}>
        {events.map((item, index) => {
          const Icon = icons[index] || Gem;
          return (
            <SectionReveal key={item.title + "-" + item.time} className="arch-event-card" delay={index * 0.08}>
              <span className="arch-card-medallion" aria-hidden="true"><Icon size={24} strokeWidth={1.4} /></span>
              <h3>{item.title}</h3>
              <p className="arch-card-venue">{invitation.location.name}</p>
              <time className="arch-card-time">{item.time}</time>
              {item.text && <p className="arch-card-note">{item.text}</p>}
            </SectionReveal>
          );
        })}
      </div>
      <SectionReveal className="calendar-save-row">
        <p className="section-kicker">{t("saveDate")}</p>
        <AddToCalendar calendar={invitation.calendar} eventSlug={invitation.slug} />
      </SectionReveal>
    </section>
  );
}