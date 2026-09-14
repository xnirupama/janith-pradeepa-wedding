const allowedEvents = new Set(["wedding", "homecoming"]);

const clean = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizePhoneNumber(value) {
  const raw = clean(value).slice(0, 40).replace(/^'/, "");
  let digits = raw.replace(/\D/g, "");
  const hasInternationalPrefix = raw.startsWith("+") || digits.startsWith("00");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) return `+94${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) return `+94${digits}`;
  if (digits.length === 11 && digits.startsWith("94")) return `+${digits}`;
  if (hasInternationalPrefix && digits) return `+${digits}`;
  return digits;
}

export function validateRsvp(payload) {
  const rawEvent = clean(payload?.event);
  const rawFullName = clean(payload?.fullName);
  const rawPhoneNumber = clean(payload?.phoneNumber);
  const rawAttending = clean(payload?.attending);
  const rawMessage = clean(payload?.message);
  const normalizedPhoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const phoneDigits = normalizedPhoneNumber.replace(/\D/g, "");
  const spam = Boolean(clean(payload?.website));
  const data = {
    event: rawEvent.toLowerCase(),
    fullName: rawFullName.slice(0, 120),
    phoneNumber: normalizedPhoneNumber,
    attending: rawAttending.toLowerCase(),
    numberOfGuests: Number(payload?.numberOfGuests),
    message: rawMessage.slice(0, 800),
  };
  const errors = {};

  if (rawEvent.length > 20 || !allowedEvents.has(data.event)) errors.event = "Please choose a valid event.";
  if (rawFullName.length < 2 || rawFullName.length > 120) errors.fullName = "Please enter your full name.";
  if (rawPhoneNumber.length > 40 || !/^[+()\-\s\d]{7,40}$/.test(rawPhoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phoneNumber = "Please enter a valid phone number.";
  }
  if (rawAttending.length > 10 || !["yes", "no"].includes(data.attending)) errors.attending = "Please let us know if you will attend.";
  if (rawMessage.length > 800) errors.message = "Please keep your message under 800 characters.";

  if (data.attending === "yes") {
    if (!Number.isInteger(data.numberOfGuests) || data.numberOfGuests < 1 || data.numberOfGuests > 20) {
      errors.numberOfGuests = "Please enter the number of guests (1–20).";
    }
  } else if (data.attending === "no") {
    data.numberOfGuests = 0;
  }

  return { valid: Object.keys(errors).length === 0, data, errors, spam };
}
