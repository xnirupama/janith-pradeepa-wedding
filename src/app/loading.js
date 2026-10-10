"use client";

import { InvitationLanguageProvider, useLanguage } from "@/components/InvitationLanguage";

function LoadingCard() {
  const { t } = useLanguage();
  return (
    <main className="loading-page" aria-label={t("preparingInvitation")} aria-live="polite">
      <div className="loading-seal" aria-hidden="true"><span>J <i>&amp;</i> P</span></div>
      <p>{t("preparingInvitation")}</p>
      <span className="loading-line" aria-hidden="true"><i /></span>
    </main>
  );
}

export default function Loading() {
  return <InvitationLanguageProvider><LoadingCard /></InvitationLanguageProvider>;
}
