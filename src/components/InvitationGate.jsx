"use client";

import { ArrowRight } from "lucide-react";
import { useSyncExternalStore } from "react";
import { LanguageToggle, useLanguage } from "./InvitationLanguage";
import { Lotus, Mandala } from "./InvitationOrnaments";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function InvitationGate({ invitation, guestName, open, onOpen }) {
  const { t } = useLanguage();
  const ready = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (open) return null;
  return (
    <div className="invitation-gate" aria-labelledby="cover-names">
      <Mandala className="gate-mandala" />
      <div className="gate-card">
        <Lotus className="gate-lotus" />
        <p className="blessing">{invitation.blessing}</p>
        <p className="sinhala-blessing" lang="si">{invitation.sinhalaBlessing}</p>
        <p className="gate-script">{t("cordiallyInvited")}</p>
        <p className="section-kicker">{invitation.eyebrow}</p>
        <h1 id="cover-names" className="couple-signature"><span>Janith</span><i>&amp;</i><span>Pradeepa</span></h1>
        <p className="gate-date">{invitation.displayDate}</p>
        {guestName && <p className="guest-line">{t("dearGuest", { guest: guestName })}</p>}
        <button type="button" className="primary-button gate-button" disabled={!ready} onClick={onOpen}>{t(ready ? "openInvitation" : "preparingInvitation")}<ArrowRight size={17} aria-hidden="true" /></button>
        <LanguageToggle />
      </div>
      <p className="gate-footnote">J <span>&amp;</span> P <i aria-hidden="true" /> {invitation.dateParts.year}</p>
    </div>
  );
}
