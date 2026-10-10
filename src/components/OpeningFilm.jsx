"use client";
import { useEffect, useMemo, useRef } from "react";
import { SkipForward } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";
import { Lotus } from "./InvitationOrnaments";
import BackgroundVideo, { clipSources } from "./BackgroundVideo";

export default function OpeningFilm({ invitation, duration = 2500, onComplete }) {
  const dialogRef = useRef(null);
  const { t } = useLanguage();
  const sources = useMemo(() => clipSources(invitation.openingClip), [invitation.openingClip]);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    const timer = setTimeout(onComplete, duration);
    return () => { clearTimeout(timer); dialog.close(); };
  }, [duration, onComplete]);
  return <dialog ref={dialogRef} className={`opening-film is-visible ${duration < 1000 ? "is-short" : ""}`} style={{ "--opening-duration": `${duration}ms` }} aria-modal="true" aria-label={invitation.gateTitle} onCancel={event => { event.preventDefault(); onComplete(); }}>
    <div className="opening-curtain curtain-left" aria-hidden="true" />
    <div className="opening-curtain curtain-right" aria-hidden="true" />
    <div className="opening-memory"><BackgroundVideo sources={sources} poster={invitation.openingClip.poster} priority="opening" /><div className="opening-film-caption"><p>{invitation.blessing}</p><span>{invitation.couple}</span></div></div>
    <div className="opening-lotus" aria-hidden="true"><Lotus decorative />{Array.from({ length: 18 }, (_, i) => <i key={i} className="opening-petal" style={{ "--petal-x": `${Math.sin(i * 2.4) * 150}px`, "--petal-y": `${-60 - (i % 6) * 30}px`, "--petal-turn": `${i * 37}deg`, "--petal-delay": `${(i % 5) * 35}ms` }} />)}</div>
    <button type="button" className="opening-film-skip" onClick={onComplete} autoFocus>{t("skipOpening")}<SkipForward size={17} aria-hidden="true" /></button>
  </dialog>;
}
