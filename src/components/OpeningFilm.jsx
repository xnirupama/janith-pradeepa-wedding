"use client";

import { forwardRef, useEffect, useRef } from "react";
import { SkipForward } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

const OpeningFilm = forwardRef(function OpeningFilm({ invitation, visible, onComplete }, ref) {
  const localRef = useRef(null);
  const videoRef = ref ?? localRef;
  const { t } = useLanguage();
  useEffect(() => {
    const video = videoRef.current;
    if (!visible) { video?.pause(); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = window.setTimeout(onComplete, 0);
      return () => window.clearTimeout(timer);
    }
    const timeout = window.setTimeout(onComplete, 20000);
    video?.play().catch(onComplete);
    return () => { window.clearTimeout(timeout); video?.pause(); };
  }, [visible, onComplete, videoRef]);
  return <div className={"opening-film " + (visible ? "is-visible" : "")} hidden={!visible} role={visible ? "dialog" : undefined} aria-modal={visible ? "true" : undefined} aria-label={invitation.gateTitle}>
    <video ref={videoRef} data-opening-src={invitation.videos.openingMobile ?? invitation.videos.opening} data-opening-poster={invitation.videoPosters?.opening ?? invitation.backgrounds.hero} muted playsInline preload="none" onEnded={() => visible && onComplete()} onError={() => visible && onComplete()} />
    {visible && <><div className="opening-film-caption"><p>{invitation.blessing}</p><span>{invitation.couple}</span></div><button type="button" className="opening-film-skip" onClick={onComplete} autoFocus>{t("skipOpening")}<SkipForward size={17} aria-hidden="true" /></button></>}
  </div>;
});
export default OpeningFilm;
