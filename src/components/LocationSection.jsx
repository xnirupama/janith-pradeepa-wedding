import { MapPin, Navigation } from "lucide-react";
import SectionReveal from "./SectionReveal";
import VideoBackdrop from "./VideoBackdrop";

export default function LocationSection({ location, invitation, active }) {
  if (!location.enabled) return null;

  return (
    <section className="location-section cinematic-section section-shell" id="location" aria-labelledby="location-title">
      <VideoBackdrop src={invitation.sectionVideos.location} fallbackSrc={invitation.videos.feature} poster={invitation.videoPosters?.location} fallbackPoster={invitation.backgrounds.section} active={active} tone={invitation.theme} overlay="strong" className="section-video" />
      <SectionReveal className="section-heading location-heading">
        <p className="section-kicker">Where we celebrate</p>
        <h2 id="location-title">The Location</h2>
        <span className="heading-flourish" aria-hidden="true" />
      </SectionReveal>
      <SectionReveal className="location-card">
        <div className="location-icon"><MapPin size={28} aria-hidden="true" /></div>
        <p className="section-kicker">Join us at</p>
        <h3 className="location-venue">{location.name}</h3>
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
