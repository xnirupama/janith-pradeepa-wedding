"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";

export default function OpeningFilm({ invitation, visible, onComplete }) {
  const videoRef = useRef(null);
  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const completeOpening = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!visible) return;
    completedRef.current = false;
    if (reduceMotion) {
      const reducedTimer = window.setTimeout(completeOpening, 250);
      return () => window.clearTimeout(reducedTimer);
    }

    // Opening films are designed to be 8–10 seconds. This safety timer prevents
    // a malformed media file from ever trapping a guest on the overlay.
    const safetyTimer = window.setTimeout(completeOpening, 15000);
    videoRef.current?.play().catch(completeOpening);
    return () => window.clearTimeout(safetyTimer);
  }, [completeOpening, reduceMotion, visible]);

  if (!visible) return null;

  return (
    <motion.div
      className="opening-film"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.75 }}
      style={{ "--opening-poster": `url(${invitation.backgrounds.hero})` }}
      aria-label={`${invitation.gateTitle} opening film`}
    >
      <video
        ref={videoRef}
        src={invitation.videos.opening}
        poster={invitation.backgrounds.hero}
        muted
        playsInline
        preload="metadata"
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          if (Number.isFinite(duration) && duration > 0 && duration - currentTime <= .12) completeOpening();
        }}
        onEnded={completeOpening}
        onError={completeOpening}
        onAbort={completeOpening}
      />
      <div className="opening-film-vignette" aria-hidden="true" />
      <div className="opening-film-caption">
        <p>{invitation.blessing}</p>
        <span>{invitation.couple}</span>
      </div>
      <button type="button" className="opening-film-skip" onClick={completeOpening} aria-label="Skip opening film">
        Skip
        <SkipForward size={15} aria-hidden="true" />
      </button>
    </motion.div>
  );
}
