"use client";

import { guestFeatures } from "@/data/features";
import SectionReveal from "./SectionReveal";
import { SectionHeading } from "./InvitationOrnaments";
import { useLanguage } from "./InvitationLanguage";

export default function GuestExtras({ invitation, features = guestFeatures }) {
  const { t } = useLanguage();
  if (!features.seatingLookup && !features.guestUploads) return null;

  return (
    <section className="guest-extras section-shell" aria-labelledby="guest-extras-title">
      <SectionHeading kicker={t("extrasKicker")} title={t("extrasTitle")} id="guest-extras-title" />
      <SectionReveal className="guest-extras-grid">
        {features.seatingLookup && (
          <div className="rsvp-card guest-extra-card">
            <h3>{t("seatingTitle")}</h3>
            <div className="form-field">
              <label htmlFor={`${invitation.slug}-seating-name`}>{t("seatingName")}</label>
              <input id={`${invitation.slug}-seating-name`} name="guestName" autoComplete="name" disabled aria-describedby={`${invitation.slug}-seating-note`} />
            </div>
            <button type="button" className="primary-button" disabled>{t("seatingLookup")}</button>
            <p id={`${invitation.slug}-seating-note`}>{t("seatingUnavailable")}</p>
          </div>
        )}
        {features.guestUploads && (
          <div className="rsvp-card guest-extra-card">
            <h3>{t("uploadTitle")}</h3>
            <div className="form-field">
              <label htmlFor={`${invitation.slug}-guest-upload`}>{t("uploadChoose")}</label>
              <input id={`${invitation.slug}-guest-upload`} name="files" type="file" accept="image/*,video/*" multiple disabled aria-describedby={`${invitation.slug}-upload-note`} />
            </div>
            <p id={`${invitation.slug}-upload-note`}>{t("uploadUnavailable")}</p>
          </div>
        )}
      </SectionReveal>
    </section>
  );
}
