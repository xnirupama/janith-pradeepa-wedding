"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { claimBackgroundVideo, hasBackgroundVideoSlot, releaseBackgroundVideo } from "@/lib/motion-environment";
import { useInvitationMotion } from "./InvitationMotion";

export default function VideoBackdrop({ clip, cover = false, className = "" }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [posterPainted, setPosterPainted] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [inView, setInView] = useState(false);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { pageVisible, backgroundVideo, suspended } = useInvitationMotion();
  const eligible = nearby && pageVisible && backgroundVideo && !suspended && posterPainted && !failed;

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const near = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), { rootMargin: window.innerHeight + "px 0px" });
    const visible = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: .01 });
    near.observe(element); visible.observe(element);
    return () => { near.disconnect(); visible.disconnect(); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !eligible || !inView) { if (video) releaseBackgroundVideo(video); return; }
    // Claim the slot before attaching sources, so even native autoplay respects
    // the two-video ceiling. Blocked or off-screen players retain their poster.
    claimBackgroundVideo(video);
    if (!video.querySelector("source[src]")) {
      const candidates = [
        ...(clip.webm && video.canPlayType('video/webm; codecs="vp9"') ? [{ src: clip.webm.src, type: 'video/webm; codecs="vp9"' }] : []),
        { src: clip.src, type: "video/mp4" },
      ];
      for (const candidate of candidates) {
        const source = document.createElement("source");
        source.src = candidate.src;
        source.type = candidate.type;
        video.appendChild(source);
      }
      video.load();
    }
    let cancelled = false;
    let playbackAttempt = 0;
    let timeout;
    const fail = () => {
      if (cancelled) return;
      setFailed(true);
      releaseBackgroundVideo(video);
    };
    const play = () => {
      const attempt = ++playbackAttempt;
      video.play().then(() => { if (attempt === playbackAttempt) window.clearTimeout(timeout); }).catch(() => { if (attempt === playbackAttempt) fail(); });
    };
    // Some WebKit builds advertise VP9 support but never decode the file.
    // Retry the universal H.264 source while keeping the poster visible.
    timeout = window.setTimeout(() => {
      if (cancelled || video.readyState >= 2) return;
      const webm = video.querySelector('source[type^="video/webm"]');
      if (!webm) { fail(); return; }
      webm.remove();
      video.load();
      timeout = window.setTimeout(fail, 8000);
      play();
    }, 2500);
    play();
    return () => { cancelled = true; window.clearTimeout(timeout); releaseBackgroundVideo(video); };
  }, [eligible, inView, clip]);

  const posterReady = () => {
    // next/image calls onLoad after decoding. Wait for a paint, then for fonts,
    // before scheduling any decorative video download.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.fonts.ready.then(() => setPosterPainted(true));
    }));
  };
  if (!clip) return null;
  return <div ref={containerRef} className={"video-backdrop " + className} aria-hidden="true" style={{ "--video-position": clip.position }}>
    <Image className="video-poster" src={clip.poster.src} alt="" fill unoptimized sizes="(max-width: 480px) 100vw, 480px" preload={cover} loading={cover ? undefined : "lazy"} onLoad={posterReady} />
    <video ref={videoRef} data-background-video poster={posterPainted ? clip.poster.src : undefined} className={playing && eligible && inView ? "is-playing" : ""} muted loop playsInline autoPlay preload="metadata" disablePictureInPicture aria-hidden="true" tabIndex={-1}
      onPlaying={() => { const video = videoRef.current; if (hasBackgroundVideoSlot(video) && eligible && inView) setPlaying(true); else video.pause(); }}
      onPause={() => setPlaying(false)} onError={() => {
        // A newly mounted player has no source until its poster is painted.
        // Browsers may report that empty state as unsupported media.
        if (!videoRef.current?.querySelector("source[src]")) return;
        setFailed(true);
        releaseBackgroundVideo(videoRef.current);
      }} />
    <span className="video-scrim" />
  </div>;
}
