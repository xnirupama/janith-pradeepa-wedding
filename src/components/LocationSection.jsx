import { MapPin, Navigation } from "lucide-react";
import SectionReveal from "./SectionReveal";

export default function LocationSection({ location }) {
  if (!location.enabled) return null;

  return (
    <section className="location-section section-shell" aria-labelledby="location-title">
      <SectionReveal className="location-card">
        <div className="location-icon"><MapPin size={28} aria-hidden="true" /></div>
        <p className="section-kicker">Join us at</p>
        <h2 id="location-title">{location.name}</h2>
        {(location.addressLines?.length > 0 || location.address) && (
          <address>
            {(location.addressLines?.length ? location.addressLines : [location.address]).map((line) => <span key={line}>{line}</span>)}
          </address>
        )}
        {location.description && <p>{location.description}</p>}
        {location.mapsUrl && (
          <a className="primary-button" href={location.mapsUrl} target="_blank" rel="noopener noreferrer">
            <Navigation size={17} aria-hidden="true" />
            Get Directions
          </a>
        )}
      </SectionReveal>
    </section>
  );
}
