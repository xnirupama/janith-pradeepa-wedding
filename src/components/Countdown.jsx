"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionReveal from "./SectionReveal";

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

export default function Countdown({ invitation }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const update = () => setRemaining(calculate(invitation.countdownTarget));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [invitation.countdownTarget]);

  const units = [
    ["days", "DAYS"],
    ["hours", "HOURS"],
    ["minutes", "MINUTES"],
    ["seconds", "SECONDS"],
  ];

  return (
    <section className="countdown-section section-shell" aria-labelledby="countdown-title">
      <SectionReveal className="section-heading">
        <p className="section-kicker">A moment worth waiting for</p>
        <h2 id="countdown-title">{invitation.countdownHeading}</h2>
        <p>{invitation.countdownText}</p>
      </SectionReveal>
      <SectionReveal className="countdown-grid" aria-live="polite">
        {units.map(([key, label]) => {
          const value = remaining ? remaining[key] : 0;
          return (
            <div className="countdown-card" key={key}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.strong
                  key={value}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8, position: "absolute" }}
                  transition={{ duration: 0.25 }}
                >
                  {String(value).padStart(2, "0")}
                </motion.strong>
              </AnimatePresence>
              <span>{label}</span>
            </div>
          );
        })}
      </SectionReveal>
      {remaining?.complete && <p className="countdown-complete">{invitation.countdownComplete}</p>}
    </section>
  );
}
