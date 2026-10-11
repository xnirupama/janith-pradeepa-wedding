"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ExternalLink, MapPin, Navigation } from "lucide-react";
import SectionReveal from "./SectionReveal";
import { SectionHeading, SunburstRing } from "./InvitationOrnaments";
import { RotatingDecoration } from "./InvitationMotion";
import { useLanguage } from "./InvitationLanguage";

const VenueMap = dynamic(() => import("./VenueMap"), { ssr: false });

export default function LocationSection({ location, images = [], active = true }) {
  const { t } = useLanguage();
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!active || !location.enabled || !mapRef.current) return;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setMapReady(true);
        observer.disconnect();
      }
    }, { rootMargin: "160px 0px" });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [active, location.enabled]);

  if (!location.enabled) return null;
  const addressLines = location.addressLines?.length ? location.addressLines : location.address ? [location.address] : [];

  return (
    <section className="location-section section-shell" id="location" aria-labelledby="location-title">
      <SectionReveal>
        <SectionHeading kicker={t("locationKicker")} title={t("locationTitle")} id="location-title" />
      </SectionReveal>
      <SectionReveal className="location-card">
        <div className="location-icon" aria-hidden="true"><RotatingDecoration className="medallion-halo" duration={54} reverse><SunburstRing /></RotatingDecoration><MapPin size={28} strokeWidth={1.4} /></div>
        <p className="section-kicker">{t("joinUsAt")}</p>
        <h3 className="location-venue">{location.name}</h3>
        {addressLines.length > 0 && <address>{addressLines.map((line) => <span key={line}>{line}</span>)}</address>}
        {location.description && <p className="location-description">{location.description}</p>}
        <div className="venue-map-shell" ref={mapRef}>
          <div className="venue-map-viewport">{active && mapReady ? <VenueMap location={location} /> : (
            <button type="button" className="venue-map-placeholder" disabled={!active} onClick={() => setMapReady(true)}>
              <MapPin size={30} aria-hidden="true" />
              <span>{t("loadMap")}</span>
            </button>
          )}</div>
          <p className="venue-map-note">{t("mapSearchNote")}</p>
          {location.mapsUrl && <a className="venue-map-open" href={location.mapsUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />{t("openMaps")}</a>}
        </div>
        {location.mapsUrl && (
          <a className="primary-button venue-directions" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation size={17} aria-hidden="true" />{t("getDirections")}
          </a>
        )}
        {images.length > 0 && <div className="venue-photos">
          {images.map(photo => <SectionReveal key={photo.image.src} as="figure" className="venue-photo">
            <Image src={photo.image} alt={t(photo.altKey, { venue: location.name })} className="venue-photo-image" sizes="(max-width: 480px) 80vw, 390px" placeholder="blur" loading="lazy" />
          </SectionReveal>)}
        </div>}
      </SectionReveal>
    </section>
  );
}
