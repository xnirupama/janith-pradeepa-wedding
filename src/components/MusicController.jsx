"use client";

import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";

export default function MusicController({ src, invitationOpen }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!invitationOpen || !audioRef.current) return;
    audioRef.current.volume = 0.35;
    audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [invitationOpen]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio || unavailable) return;
    if (audio.paused) {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
      setPlaying(false);
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
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onError={() => { setUnavailable(true); setPlaying(false); }}
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
