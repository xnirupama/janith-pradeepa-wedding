"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoBackdrop({
  src,
  fallbackSrc,
  poster,
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
  const [staticOnly, setStaticOnly] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [ready, setReady] = useState(false);
  const videoSrc = useFallback ? fallbackSrc : src;

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const updatePreference = () => setStaticOnly(reduceMotion.matches || Boolean(connection?.saveData));

    updatePreference();
    reduceMotion.addEventListener?.("change", updatePreference);
    connection?.addEventListener?.("change", updatePreference);
    return () => {
      reduceMotion.removeEventListener?.("change", updatePreference);
      connection?.removeEventListener?.("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !active || failed || staticOnly || !videoSrc) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearby(entry.isIntersecting);
        if (!entry.isIntersecting) setReady(false);
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [active, failed, staticOnly, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (nearby && active && !staticOnly) video.play().catch(() => {});
    else video.pause();
  }, [active, nearby, staticOnly, videoSrc]);

  const shouldMountVideo = Boolean(videoSrc && active && nearby && !failed && !staticOnly);

  const handleVideoError = () => {
    setReady(false);
    if (!useFallback && fallbackSrc && fallbackSrc !== src) setUseFallback(true);
    else setFailed(true);
  };

  return (
    <div
      ref={containerRef}
      className={`video-backdrop video-backdrop--${tone} video-backdrop--${overlay} ${className} ${failed || staticOnly ? "video-fallback" : ""}`}
      style={{
        "--video-poster": poster ? `url(${poster})` : "none",
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
          poster={poster}
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
