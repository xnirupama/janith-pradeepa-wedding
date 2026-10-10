"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Expand } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

const GalleryLightbox = dynamic(() => import("./GalleryLightbox"), { ssr: false });

export default function Gallery({ images = [] }) {
  const { t } = useLanguage();
  const [viewer, setViewer] = useState(null);
  const close = useCallback(() => setViewer(null), []);

  if (!images.length) return null;

  return (
    <section className="gallery-section section-shell" id="gallery" aria-labelledby="gallery-title">
      <SectionReveal>
        <SectionHeading id="gallery-title" kicker={t("galleryKicker")} title={t("galleryTitle")} />
      </SectionReveal>
      <div className={`gallery-grid ${images.length === 1 ? "gallery-single" : images.length === 2 ? "gallery-pair" : "gallery-bento"}`}>
        {images.map((image, index) => (
          <SectionReveal key={image.src} className={`gallery-tile ${index === 0 ? "gallery-feature" : `tile-${(index % 4) + 1}`}`} delay={(index % 4) * 0.08}>
            <button
              className="gallery-photo"
              type="button"
              onClick={(event) => {
                setViewer({ index, trigger: event.currentTarget });
              }}
              aria-label={`${t("galleryOpen")} ${index + 1}: ${t("photoAlt")}`}
              aria-haspopup="dialog"
            >
              <Image
                className="gallery-image"
                src={image.src}
                alt={t("photoAlt")}
                fill
                sizes={images.length === 1 ? "(max-width: 480px) 88vw, 430px" : "(max-width: 480px) 43vw, 210px"}
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
                loading="lazy"
              />
              <span className="gallery-open-hint" aria-hidden="true"><Expand size={16} /></span>
              <span className="gallery-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            </button>
          </SectionReveal>
        ))}
      </div>
      {viewer !== null && (
        <GalleryLightbox images={images} initialIndex={viewer.index} onClose={close} restoreFocusTo={viewer.trigger} />
      )}
    </section>
  );
}
