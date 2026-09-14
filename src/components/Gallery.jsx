"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function Gallery({ images, invitation, contentActive }) {
  const [active, setActive] = useState(null);
  const [loaded, setLoaded] = useState({});
  const touchStart = useRef(null);

  const close = useCallback(() => setActive(null), []);
  const previous = useCallback(() => setActive((current) => (current - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((current) => (current + 1) % images.length), [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, previous]);

  useEffect(() => {
    if (active === null || images.length < 2) return;
    const adjacent = [
      images[(active - 1 + images.length) % images.length],
      images[(active + 1) % images.length],
    ];
    adjacent.forEach((image) => {
      const preload = new window.Image();
      preload.src = image.src;
    });
  }, [active, images]);

  if (!images.length) return null;

  return (
    <section className="gallery-section cinematic-section section-shell" aria-labelledby="gallery-title">
      <VideoBackdrop src={invitation.sectionVideos.gallery} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.gallery} fallbackPoster={invitation.backgrounds.section} active={contentActive} tone={invitation.theme} overlay="strong" className="section-video" opacity={.68} />
      <SectionReveal className="section-heading">
        <p className="section-kicker">A few favourite moments</p>
        <h2 id="gallery-title">Our Gallery</h2>
      </SectionReveal>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <SectionReveal key={image.src} className={`gallery-tile tile-${(index % 5) + 1}`} delay={(index % 4) * 0.06}>
            <button className={loaded[image.src] ? "is-loaded" : "is-loading"} type="button" onClick={() => setActive(index)} aria-label={`Open gallery image ${index + 1}`}>
              <span className="gallery-skeleton" aria-hidden="true" />
              <Image className="gallery-image" src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 48vw, 30vw" onLoad={() => setLoaded((current) => ({ ...current, [image.src]: true }))} />
              <span className="gallery-number">{String(index + 1).padStart(2, "0")}</span>
            </button>
          </SectionReveal>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
            onTouchEnd={(event) => {
              if (touchStart.current === null) return;
              const distance = event.changedTouches[0].clientX - touchStart.current;
              if (Math.abs(distance) > 45) distance > 0 ? previous() : next();
              touchStart.current = null;
            }}
          >
            <button className="lightbox-close" type="button" onClick={close} aria-label="Close gallery"><X /></button>
            <button className="lightbox-nav lightbox-prev" type="button" onClick={(e) => { e.stopPropagation(); previous(); }} aria-label="Previous image"><ChevronLeft /></button>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={images[active].src} className="lightbox-image" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.975 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.015 }} transition={{ duration: .28 }}>
                <Image src={images[active].src} alt={images[active].alt} fill sizes="95vw" priority />
              </motion.div>
            </AnimatePresence>
            <button className="lightbox-nav lightbox-next" type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image"><ChevronRight /></button>
            <div className="lightbox-progress" aria-hidden="true"><i style={{ transform: `scaleX(${(active + 1) / images.length})` }} /></div>
            <span className="lightbox-count">{String(active + 1).padStart(2, "0")} <i>/</i> {String(images.length).padStart(2, "0")}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
