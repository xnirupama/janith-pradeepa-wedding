"use client";

import { forwardRef, useEffect, useRef } from "react";
import { SkipForward } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

const OpeningFilm = forwardRef(function OpeningFilm({ invitation, visible, onComplete }, ref) {
  const localRef = useRef(null);
  const dialogRef = useRef(null);
  const videoRef = ref ?? localRef;
  const { t } = useLanguage();
  useEffect(() => {
    const video = videoRef.current;
    const dialog = dialogRef.current;
    if (!visible) { video?.pause(); if (dialog?.open) dialog.close(); return; }
    if (dialog && !dialog.open) dialog.showModal();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(onComplete, 0);
      return () => window.clearTimeout(timer);
    }
    const timeout = window.setTimeout(onComplete, 20000);
    video?.play().catch(onComplete);
    return () => { window.clearTimeout(timeout); video?.pause(); if (dialog?.open) dialog.close(); };
  }, [visible, onComplete, videoRef]);
  return <dialog ref={dialogRef} className={"opening-film " + (visible ? "is-visible" : "")} hidden={!visible} aria-modal={visible ? "true" : undefined} aria-label={invitation.gateTitle} onCancel={(event) => { event.preventDefault(); onComplete(); }} onKeyDown={(event) => { if (event.key === "Tab") { event.preventDefault(); event.currentTarget.querySelector("button")?.focus(); } }}>
    <video ref={videoRef} data-opening-src={invitation.videos.openingMobile ?? invitation.videos.opening} data-opening-poster={invitation.videoPosters?.opening ?? invitation.backgrounds.hero} muted playsInline preload="none" onEnded={() => visible && onComplete()} onError={() => visible && onComplete()} />
    {visible && <><div className="opening-film-caption"><p>{invitation.blessing}</p><span>{invitation.couple}</span></div><button type="button" className="opening-film-skip" onClick={onComplete} autoFocus>{t("skipOpening")}<SkipForward size={17} aria-hidden="true" /></button></>}
  </dialog>;
});
export default OpeningFilm;
