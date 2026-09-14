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
