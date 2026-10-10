"use client";

import { ExternalLink } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

export default function VenueMap({ location }) {
  const { t } = useLanguage();
  const address = location.addressLines?.length ? location.addressLines.join(", ") : location.address || "";
  const query = [location.name, address, "Sri Lanka"].filter(Boolean).join(", ");
  const embedUrl = "https://maps.google.com/maps?q=" + encodeURIComponent(query) + "&output=embed";

  return (
    <>
      <iframe
        className="venue-map-frame"
        title={t("mapPreview") + ": " + location.name}
        src={embedUrl}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <p className="venue-map-note">{t("mapSearchNote")}</p>
      {location.mapsUrl && <a className="venue-map-open" href={location.mapsUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={15} aria-hidden="true" />{t("openMaps")}</a>}
    </>
  );
}