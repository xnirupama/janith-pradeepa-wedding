"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";

const TARGET_VOLUME = 0.35;
const FADE_IN_MS = 1750;
const FADE_OUT_MS = 650;

export default function MusicController({ src, invitationOpen }) {
  const audioRef = useRef(null);
  const fadeFrameRef = useRef(null);
  const intendedPlayingRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  const cancelFade = () => {
    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current);
      fadeFrameRef.current = null;
    }
  };

  const fadeTo = (target, duration, pauseAfter = false) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelFade();
    const startVolume = audio.volume;
    const startedAt = performance.now();

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = Math.max(0, Math.min(1, startVolume + (target - startVolume) * eased));
      if (progress < 1) {
        fadeFrameRef.current = window.requestAnimationFrame(step);
      } else {
        fadeFrameRef.current = null;
        if (pauseAfter && !intendedPlayingRef.current) audio.pause();
      }
    };

    fadeFrameRef.current = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    if (!invitationOpen || !audioRef.current) return;
    const audio = audioRef.current;
    intendedPlayingRef.current = true;
    if (audio.paused) audio.volume = 0;
    audio.play().then(() => fadeTo(TARGET_VOLUME, FADE_IN_MS)).catch(() => {
      intendedPlayingRef.current = false;
      setPlaying(false);
    });

    return cancelFade;
    // The invitation opens once; fadeTo intentionally uses the current audio ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationOpen]);

  useEffect(() => () => cancelFade(), []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;
    if (!intendedPlayingRef.current) {
      intendedPlayingRef.current = true;
      if (audio.paused) audio.volume = 0;
      try {
        await audio.play();
        fadeTo(TARGET_VOLUME, FADE_IN_MS);
      } catch {
        intendedPlayingRef.current = false;
        setPlaying(false);
      }
    } else {
      intendedPlayingRef.current = false;
      fadeTo(0, FADE_OUT_MS, true);
    }
  };

  return (
    <>
      <audio
        id="invitation-music"
        ref={audioRef}
        src={src}
        loop
        preload="none"
        onPause={() => { if (!intendedPlayingRef.current) setPlaying(false); }}
        onPlay={() => setPlaying(true)}
        onError={() => { intendedPlayingRef.current = false; cancelFade(); setUnavailable(true); setPlaying(false); }}
      />
      {invitationOpen && (
        <button
          type="button"
          className={`music-control ${playing ? "is-playing" : ""}`}
          onClick={toggle}
          disabled={unavailable}
          aria-label={unavailable ? "Background music unavailable" : playing ? "Pause background music" : "Play background music"}
          title={unavailable ? "Music will be available when an audio file is added" : undefined}
        >
          <span className="music-ring" aria-hidden="true" />
          {unavailable ? <Music2 size={20} /> : playing ? <Pause size={19} /> : <Play size={19} fill="currentColor" />}
        </button>
      )}
    </>
  );
}
