function escapeIcs(value = "") {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

export function createCalendarFile(calendar) {
  const now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const dates = calendar.allDay
    ? [`DTSTART;VALUE=DATE:${calendar.startDate}`, `DTEND;VALUE=DATE:${calendar.endDate}`]
    : [`DTSTART;TZID=Asia/Colombo:${calendar.start}`, `DTEND;TZID=Asia/Colombo:${calendar.end}`];

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Janith and Pradeepa//Invitation//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${calendar.start || calendar.startDate}-janith-pradeepa@invitation`,
    `DTSTAMP:${now}`,
    ...dates,
    `SUMMARY:${escapeIcs(calendar.title)}`,
    `DESCRIPTION:${escapeIcs(calendar.description)}`,
    ...(calendar.location ? [`LOCATION:${escapeIcs(calendar.location)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function createGoogleCalendarUrl(calendar) {
  const dates = calendar.allDay
    ? `${calendar.startDate}/${calendar.endDate}`
    : `${calendar.start}/${calendar.end}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: calendar.title,
    dates,
    details: calendar.description || "",
    location: calendar.location || "",
  });
  if (!calendar.allDay) params.set("ctz", "Asia/Colombo");
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
