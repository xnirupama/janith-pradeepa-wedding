"use client";

import { useEffect, useState } from "react";
import SectionReveal from "./SectionReveal";
import { Lotus, SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

function calculate(target) {
  const distance = Math.max(0, new Date(target).getTime() - Date.now());
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    complete: distance === 0,
  };
}

export default function Countdown({ invitation, active = true }) {
  const { t } = useLanguage();
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!active) return;
    let timer;
    const update = () => {
      const next = calculate(invitation.countdownTarget);
      setRemaining(next);
      if (next.complete) window.clearInterval(timer);
    };
    const frame = window.requestAnimationFrame(update);
    timer = window.setInterval(update, 1000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, [active, invitation.countdownTarget]);

  return (
    <section className="countdown-section section-shell" aria-labelledby="countdown-title">
      <SectionReveal>
        <SectionHeading kicker={t("countdownKicker")} title={invitation.countdownHeading} id="countdown-title" />
        <p className="section-intro">{invitation.countdownText}</p>
      </SectionReveal>
      {remaining?.complete ? (
        <div className="countdown-arrived" role="status">
          <Lotus className="countdown-lotus" />
          <h3>{t("specialDayArrived")}</h3>
          <p className="countdown-complete">{invitation.countdownComplete}</p>
        </div>
      ) : (
        <SectionReveal className="countdown-grid">
          {["days", "hours", "minutes", "seconds"].map((unit) => (
            <div className="countdown-card" key={unit}>
              <strong className="countdown-number">{remaining ? String(remaining[unit]).padStart(2, "0") : "—"}</strong>
              <span className="countdown-label">{t(unit)}</span>
            </div>
          ))}
        </SectionReveal>
      )}
    </section>
  );
}