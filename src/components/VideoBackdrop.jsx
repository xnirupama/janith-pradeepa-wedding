"use client";

import { useEffect, useRef, useState } from "react";

export default function VideoBackdrop({ src, className = "", active = true }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !active || failed) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearby(entry.isIntersecting),
      { rootMargin: "300px 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [active, failed]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (nearby && active) video.play().catch(() => {});
    else video.pause();
  }, [nearby, active]);

  return (
    <div ref={containerRef} className={`video-backdrop ${className} ${failed ? "video-fallback" : ""}`} aria-hidden="true">
      {active && nearby && !failed && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
