"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useLanguage } from "./InvitationLanguage";

export default function ShareInvitation({ invitation }) {
  const { t } = useLanguage();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const showMessage = (key) => {
    window.clearTimeout(timerRef.current);
    setMessage(key);
    timerRef.current = window.setTimeout(() => setMessage(""), 3200);
  };

  const copyLink = async (url) => {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
    } else {
      const input = document.createElement("textarea");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      if (!copied) throw new Error("Clipboard unavailable");
    }
    showMessage("shareCopied");
  };

  const share = async () => {
    setBusy(true);
    const url = window.location.href;
    const data = { title: invitation.eventTitle, text: t("shareText") + invitation.eventTitle + ".", url };
    try {
      if (navigator.share) {
        await navigator.share(data);
        showMessage("shareSuccess");
      } else {
        await copyLink(url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        try { await copyLink(url); }
        catch { showMessage("shareFallback"); }
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="share-invitation">
      <button type="button" className="secondary-button share-button" onClick={share} disabled={busy} aria-label={t("shareInvitation") + ": " + invitation.eventTitle}>
        <Share2 size={17} aria-hidden="true" />{t("shareInvitation")}
      </button>
      <span className={"share-toast" + (message ? " is-visible" : "")} role="status">
        {message && <>{message !== "shareFallback" && <Check size={14} aria-hidden="true" />}{t(message)}</>}
      </span>
    </div>
  );
}