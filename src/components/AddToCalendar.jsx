"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarPlus, Download, ExternalLink, X } from "lucide-react";
import { createCalendarFile, createGoogleCalendarUrl } from "@/lib/calendar";

export default function AddToCalendar({ calendar, eventSlug }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const firstActionRef = useRef(null);

  const close = () => {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    firstActionRef.current?.focus();
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const download = () => {
    const blob = new Blob([createCalendarFile(calendar)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `janith-pradeepa-${eventSlug}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    close();
  };

  return (
    <>
      <button
        type="button"
        ref={triggerRef}
        className="secondary-button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${eventSlug}-calendar-actions`}
      >
        <CalendarPlus size={17} aria-hidden="true" />
        Add to Calendar
      </button>
      {open && (
        <div className="calendar-sheet-backdrop" onPointerDown={close}>
          <div
            className="calendar-sheet"
            id={`${eventSlug}-calendar-actions`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${eventSlug}-calendar-title`}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <button className="calendar-sheet-close" type="button" onClick={close} aria-label="Close calendar options"><X size={18} /></button>
            <p className="section-kicker">Save the date</p>
            <h3 id={`${eventSlug}-calendar-title`}>Add to Calendar</h3>
            <a ref={firstActionRef} href={createGoogleCalendarUrl(calendar)} target="_blank" rel="noopener noreferrer" onClick={close}>
              <ExternalLink size={18} aria-hidden="true" />
              <span><strong>Google Calendar</strong><small>Open a ready-to-save event</small></span>
            </a>
            <button type="button" onClick={download}>
              <Download size={18} aria-hidden="true" />
              <span><strong>Download Calendar File</strong><small>Works with Apple, Outlook and more</small></span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
