"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Download, ExternalLink, X } from "lucide-react";
import { createCalendarFile, createGoogleCalendarUrl } from "@/lib/calendar";
import { useLanguage } from "./InvitationLanguage";

export default function AddToCalendar({ calendar, eventSlug }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const firstActionRef = useRef(null);

  const close = () => dialogRef.current?.close();
  const openCalendar = () => {
    dialogRef.current?.showModal();
    setOpen(true);
    firstActionRef.current?.focus();
  };
  const restoreFocus = () => {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  const download = () => {
    const blob = new Blob([createCalendarFile(calendar)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "janith-pradeepa-" + eventSlug + ".ics";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    close();
  };

  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    const actions = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled])')];
    const first = actions[0];
    const last = actions[actions.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="secondary-button calendar-trigger"
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={eventSlug + "-calendar-actions"}
      >
        <CalendarPlus size={17} aria-hidden="true" />{t("addCalendar")}
      </button>
      <dialog
        ref={dialogRef}
        className="calendar-sheet"
        id={eventSlug + "-calendar-actions"}
        aria-labelledby={eventSlug + "-calendar-title"}
        onClose={restoreFocus}
        onKeyDown={trapFocus}
        onClick={(event) => {
          if (event.target !== dialogRef.current) return;
          const rect = dialogRef.current.getBoundingClientRect();
          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
        }}
      >
        <button className="calendar-sheet-close" type="button" onClick={close} aria-label={t("closeCalendar")}><X size={18} aria-hidden="true" /></button>
        <p className="section-kicker">{t("saveDate")}</p>
        <h3 id={eventSlug + "-calendar-title"}>{t("addCalendar")}</h3>
        <a ref={firstActionRef} href={createGoogleCalendarUrl(calendar)} target="_blank" rel="noopener noreferrer" onClick={close}>
          <ExternalLink size={18} aria-hidden="true" />
          <span><strong>{t("googleCalendar")}</strong><small>{t("googleCalendarHint")}</small></span>
        </a>
        <button type="button" onClick={download}>
          <Download size={18} aria-hidden="true" />
          <span><strong>{t("downloadCalendar")}</strong><small>{t("downloadCalendarHint")}</small></span>
        </button>
      </dialog>
    </>
  );
}