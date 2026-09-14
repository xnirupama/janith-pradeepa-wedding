"use client";

import { CalendarPlus } from "lucide-react";
import { createCalendarFile } from "@/lib/calendar";

export default function AddToCalendar({ calendar, eventSlug }) {
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
  };

  return (
    <button type="button" className="secondary-button" onClick={download}>
      <CalendarPlus size={17} aria-hidden="true" />
      Add to Calendar
    </button>
  );
}
