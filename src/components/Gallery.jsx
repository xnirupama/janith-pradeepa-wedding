"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import SectionReveal from "./SectionReveal";

export default function Gallery({ images }) {
  const [active, setActive] = useState(null);
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
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, previous]);

  if (!images.length) return null;

  return (
    <section className="gallery-section section-shell" aria-labelledby="gallery-title">
      <SectionReveal className="section-heading">
        <p className="section-kicker">A few favourite moments</p>
        <h2 id="gallery-title">Our Gallery</h2>
      </SectionReveal>
      <div className="gallery-grid">
        {images.map((image, index) => (
          <SectionReveal key={image.src} className={`gallery-tile tile-${(index % 5) + 1}`} delay={(index % 4) * 0.06}>
            <button type="button" onClick={() => setActive(index)} aria-label={`Open gallery image ${index + 1}`}>
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 700px) 48vw, 30vw" />
              <span>{String(index + 1).padStart(2, "0")}</span>
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
            <motion.div className="lightbox-image" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.96 }} animate={{ scale: 1 }}>
              <Image src={images[active].src} alt={images[active].alt} fill sizes="95vw" priority />
            </motion.div>
            <button className="lightbox-nav lightbox-next" type="button" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next image"><ChevronRight /></button>
            <span className="lightbox-count">{active + 1} / {images.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
