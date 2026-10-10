"use client";

import { InvitationLanguageProvider, useLanguage } from "@/components/InvitationLanguage";
import LotusLoader from "@/components/LotusLoader";

function LoadingCard() {
  const { t } = useLanguage();
  return (
    <main className="loading-page" aria-label={t("preparingInvitation")} aria-live="polite">
      <LotusLoader label={t("preparingInvitation")} />
    </main>
  );
}

export default function Loading() {
  return <InvitationLanguageProvider><LoadingCard /></InvitationLanguageProvider>;
}
