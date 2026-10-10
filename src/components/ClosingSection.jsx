"use client";

import { ArrowUp, RotateCcw } from "lucide-react";
import SectionReveal from "./SectionReveal";
import ShareInvitation from "./ShareInvitation";
import { ContactPill, Lotus, Mandala } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

export default function ClosingSection({ invitation, onReplayOpening }) {
  const { t } = useLanguage();
  const [year, month, day] = invitation.countdownTarget.slice(0, 10).split("-");
  const backToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.replaceState(null, "", "#top");
  };

  return (
    <footer className="closing-section" id="contact" aria-labelledby="closing-title">
      <Mandala className="closing-mandala" />
      <SectionReveal className="closing-content">
        <p className="closing-save-date section-kicker">{t("saveDate")}</p>
        <time className="closing-date" dateTime={invitation.countdownTarget.slice(0, 10)}>{day} . {month} . {year.slice(-2)}</time>
        <Lotus className="closing-lotus" />
        <p className="blessing">{invitation.blessing}</p>
        <p className="sinhala-blessing" lang="si">{invitation.sinhalaBlessing}</p>
        <h2 id="closing-title">{invitation.couple}</h2>
        <span className="closing-divider" aria-hidden="true" />
        {invitation.closingLead && <p className="closing-lead">{invitation.closingLead}</p>}
        <div className="closing-copy">{invitation.closing.map((line) => <p key={line}>{line}</p>)}</div>
        <div className="closing-contact-actions">
          <p className="section-kicker">{t("contactHelpKicker")}</p>
          <h3>{t("contactTitle")}</h3>
          <p>{t("contactHelpText")}</p>
          {invitation.location.contact && <ContactPill contact={invitation.location.contact} />}
        </div>
        <div className="closing-actions">
          <ShareInvitation invitation={invitation} />
          <button type="button" className="replay-opening" onClick={onReplayOpening}><RotateCcw size={16} aria-hidden="true" />{t("replayOpening")}</button>
          <button type="button" className="back-to-top" onClick={backToTop}><ArrowUp size={16} aria-hidden="true" />{t("backToTop")}</button>
        </div>
      </SectionReveal>
    </footer>
  );
}
