"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";

export default function ShareInvitation({ invitation }) {
  const [message, setMessage] = useState("");
  const timerRef = useRef(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  const showMessage = (nextMessage) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMessage(nextMessage);
    timerRef.current = window.setTimeout(() => setMessage(""), 2600);
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
      document.execCommand("copy");
      input.remove();
    }
    showMessage("Invitation link copied");
  };

  const share = async () => {
    const url = window.location.href;
    const data = {
      title: invitation.eventTitle,
      text: `You are invited to ${invitation.eventTitle}.`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        showMessage("Invitation shared");
      } else {
        await copyLink(url);
      }
    } catch (error) {
      if (error?.name !== "AbortError") {
        try {
          await copyLink(url);
        } catch {
          showMessage("Please copy the page link from your browser");
        }
      }
    }
  };

  return (
    <div className="share-invitation">
      <button type="button" className="secondary-button share-button" onClick={share} aria-label={`Share ${invitation.eventTitle}`}>
        <Share2 size={17} aria-hidden="true" />
        Share Invitation
      </button>
      <span className={`share-toast ${message ? "is-visible" : ""}`} role="status" aria-live="polite">
        {message && <><Check size={14} aria-hidden="true" />{message}</>}
      </span>
    </div>
  );
}
