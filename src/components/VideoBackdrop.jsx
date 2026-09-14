"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoBackdrop({
  src,
  fallbackSrc,
  poster,
  fallbackPoster,
  className = "",
  active = true,
  tone = "wedding",
  overlay = "soft",
  position = "center",
  opacity = 1,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [loadProfile, setLoadProfile] = useState("static");
  const [useFallback, setUseFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const [posterSrc, setPosterSrc] = useState(fallbackPoster || poster || "");
  const videoSrc = useFallback ? fallbackSrc : src;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const updatePreference = () => {
      const effectiveType = connection?.effectiveType;
      if (reduceMotion.matches || connection?.saveData || effectiveType === "slow-2g" || effectiveType === "2g") {
        setLoadProfile("static");
      } else if (effectiveType === "3g") {
        setLoadProfile("conservative");
      } else {
        setLoadProfile("normal");
      }
    };

    updatePreference();
    reduceMotion.addEventListener?.("change", updatePreference);
    connection?.addEventListener?.("change", updatePreference);
    return () => {
      reduceMotion.removeEventListener?.("change", updatePreference);
      connection?.removeEventListener?.("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    const safePoster = fallbackPoster || poster || "";
    if (!nearby || loadProfile === "static" || !poster || poster === safePoster) return;
    let cancelled = false;
    const preload = new window.Image();
    preload.onload = () => { if (!cancelled) setPosterSrc(poster); };
    preload.onerror = () => { if (!cancelled) setPosterSrc(safePoster); };
    preload.src = poster;
    return () => { cancelled = true; };
  }, [fallbackPoster, loadProfile, nearby, poster]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !active || failed || loadProfile === "static" || !videoSrc) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearby(entry.isIntersecting);
        if (!entry.isIntersecting) setReady(false);
      },
      { rootMargin: loadProfile === "conservative" ? "150px 0px" : "220px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [active, failed, loadProfile, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (nearby && active && loadProfile !== "static") video.play().catch(() => {});
    else video.pause();
  }, [active, loadProfile, nearby, videoSrc]);

  const shouldMountVideo = Boolean(videoSrc && active && nearby && !failed && loadProfile !== "static");

  const handleVideoError = () => {
    setReady(false);
    if (!useFallback && fallbackSrc && fallbackSrc !== src) setUseFallback(true);
    else setFailed(true);
  };

  return (
    <div
      ref={containerRef}
      className={`video-backdrop video-backdrop--${tone} video-backdrop--${overlay} ${className} ${failed || loadProfile === "static" ? "video-fallback" : ""}`}
      style={{
        "--video-poster": posterSrc ? `url("${posterSrc}")` : "none",
        "--video-position": position,
        "--video-opacity": opacity,
      }}
      aria-hidden="true"
    >
      {shouldMountVideo && (
        <video
          key={videoSrc}
          ref={videoRef}
          src={videoSrc}
          poster={posterSrc || undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className={ready ? "is-ready" : ""}
          onCanPlay={() => setReady(true)}
          onError={handleVideoError}
        />
      )}
    </div>
  );
}
