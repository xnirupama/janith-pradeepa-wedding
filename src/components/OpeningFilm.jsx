"use client";
import { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Play, SkipForward } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";
import { DottedRing, Lotus } from "./InvitationOrnaments";
import BackgroundVideo, { clipSources } from "./BackgroundVideo";
import LotusLoader from "./LotusLoader";

export default function OpeningFilm({ ref, invitation, visible, duration = 2500, onReveal, onComplete }) {
  const dialogRef = useRef(null), videoRef = useRef(null);
  const [phase, setPhase] = useState("film"), [videoStatus, setVideoStatus] = useState("loading");
  const { t } = useLanguage();
  const sources = useMemo(() => clipSources(invitation.openingClip), [invitation.openingClip]);
  useImperativeHandle(ref, () => ({ play() {
    setPhase("film"); setVideoStatus("loading");
    const dialog = dialogRef.current;
    dialog.hidden = false;
    if (!dialog.open) dialog.showModal();
    videoRef.current?.play();
  } }), []);
  const reveal = useCallback(() => { setPhase("reveal"); onReveal(); }, [onReveal]);
  useEffect(() => {
    if (visible) return;
    videoRef.current?.stop();
    if (dialogRef.current.open) dialogRef.current.close();
  }, [visible]);
  useEffect(() => {
    if (!visible || phase !== "reveal") return;
    const timer = setTimeout(onComplete, duration);
    return () => clearTimeout(timer);
  }, [visible, phase, duration, onComplete]);
  const revealing = phase === "reveal";
  return <dialog ref={dialogRef} hidden={!visible} className={`opening-film ${visible ? "is-visible" : ""} ${revealing ? "is-revealing" : "is-playing-film"} ${duration < 1000 ? "is-short" : ""}`} style={{ "--opening-duration": `${duration}ms` }} aria-modal="true" aria-label={t("openingFilm")} onCancel={event => { event.preventDefault(); onComplete(); }}>
    <div className="opening-memory"><BackgroundVideo ref={videoRef} sources={sources} poster={invitation.openingClip.poster} priority="opening" active={visible} className="opening-video" onPlaybackState={setVideoStatus} onEnded={reveal} /><div className="opening-film-caption"><p>{invitation.blessing}</p><span>{invitation.couple}</span></div></div>
    {revealing ? <>
      <div className="opening-curtain curtain-left" aria-hidden="true" />
      <div className="opening-curtain curtain-right" aria-hidden="true" />
      <div className="opening-lotus" aria-hidden="true"><span className="opening-loader-ring"><DottedRing /></span><Lotus decorative />{Array.from({ length: 18 }, (_, i) => <i key={i} className="opening-petal" style={{ "--petal-x": `${Math.sin(i * 2.4) * 150}px`, "--petal-y": `${-60 - (i % 6) * 30}px`, "--petal-turn": `${i * 37}deg`, "--petal-delay": `${(i % 5) * 35}ms` }} />)}</div>
    </> : visible && videoStatus !== "playing" && <div className="opening-playback-status">
      {videoStatus === "fallback" ? <><p>{t("openingPlaybackHelp")}</p><button type="button" className="primary-button opening-play-button" onClick={() => videoRef.current?.play()}><Play size={18} aria-hidden="true" />{t("playOpeningVideo")}</button></> : <LotusLoader label={t("preparingInvitation")} />}
    </div>}
    {visible && <button type="button" className="opening-film-skip" onClick={onComplete} autoFocus>{t("skipOpening")}<SkipForward size={17} aria-hidden="true" /></button>}
  </dialog>;
}
