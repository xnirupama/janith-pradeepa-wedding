"use client";

import { forwardRef, useCallback, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SkipForward } from "lucide-react";

// How long to wait before giving up and skipping the film.
// Generous for slow mobile connections — the skip button is always available.
const SAFETY_TIMEOUT_MS = 20000;

// forwardRef lets EventExperience hold a ref to the underlying <video> element
// and call .play() synchronously inside the "Open Invitation" tap handler,
// BEFORE setOpen(true) triggers a re-render. iOS Safari requires that play()
// be called in the same synchronous call stack as the user gesture — any async
// gap (useEffect, setTimeout, Promise microtask) causes NotAllowedError.
const OpeningFilm = forwardRef(function OpeningFilm(
  { invitation, visible, onComplete },
  videoRef
) {
  const internalVideoRef = useRef(null);
  // Use the forwarded ref if provided, otherwise use our own.
  const resolvedVideoRef = videoRef ?? internalVideoRef;

  const completedRef = useRef(false);
  const reduceMotion = useReducedMotion();

  const completeOpening = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Kick off buffering as early as possible. The video element is always in
  // the DOM so the browser can start fetching without waiting for the gate.
  useEffect(() => {
    const video = resolvedVideoRef.current;
    if (!video) return;
    video.preload = "auto";
    video.load();
    // resolvedVideoRef is a stable object — intentionally not in dep array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    completedRef.current = false;

    if (reduceMotion) {
      const reducedTimer = window.setTimeout(completeOpening, 250);
      return () => window.clearTimeout(reducedTimer);
    }

    // Safety timer: prevents a malformed file from ever trapping a guest.
    const safetyTimer = window.setTimeout(completeOpening, SAFETY_TIMEOUT_MS);

    const video = resolvedVideoRef.current;
    if (!video) return () => window.clearTimeout(safetyTimer);

    // Reset to start (important for replays).
    video.currentTime = 0;

    // Attempt play. On iOS this may already be running because EventExperience
    // called play() synchronously on the tap — this is a belt-and-braces call.
    const playAttempt = video.play();
    if (playAttempt !== undefined) {
      playAttempt.catch((err) => {
        if (err?.name === "NotAllowedError") {
          // One retry after a short delay — some Android WebViews need this.
          const retryTimer = window.setTimeout(() => {
            video.play().catch(completeOpening);
          }, 300);
          return () => window.clearTimeout(retryTimer);
        }
        // Network error, unsupported format, etc. — just skip to the invitation.
        completeOpening();
      });
    }

    return () => window.clearTimeout(safetyTimer);
    // resolvedVideoRef is a stable object — intentionally not in dep array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeOpening, reduceMotion, visible]);

  return (
    <>
      {/*
        The video element is ALWAYS in the DOM so the browser can buffer it
        and so EventExperience can call .play() synchronously on the tap event.
        It is hidden from view (and from layout) until the overlay is shown.
      */}
      <video
        ref={resolvedVideoRef}
        src={invitation.videos.opening}
        poster={invitation.backgrounds.hero}
        muted
        playsInline
        preload="auto"
        data-opening-video
        style={{ display: "none" }}
        onTimeUpdate={(event) => {
          if (!visible) return;
          const { currentTime, duration } = event.currentTarget;
          if (Number.isFinite(duration) && duration > 0 && duration - currentTime <= 0.12)
            completeOpening();
        }}
        onEnded={completeOpening}
        onError={completeOpening}
        onAbort={completeOpening}
      />

      {visible && (
        <motion.div
          className="opening-film"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.75 }}
          style={{ "--opening-poster": `url(${invitation.backgrounds.hero})` }}
          aria-label={`${invitation.gateTitle} opening film`}
        >
          <div className="opening-film-vignette" aria-hidden="true" />
          <div className="opening-film-caption">
            <p>{invitation.blessing}</p>
            <span>{invitation.couple}</span>
          </div>
          <button
            type="button"
            className="opening-film-skip"
            onClick={completeOpening}
            aria-label="Skip opening film"
          >
            Skip
            <SkipForward size={15} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </>
  );
});

export default OpeningFilm;
