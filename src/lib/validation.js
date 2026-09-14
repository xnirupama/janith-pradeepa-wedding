const allowedEvents = new Set(["wedding", "homecoming"]);

const clean = (value, maxLength) => (typeof value === "string" ? value.trim().slice(0, maxLength) : "");

export function normalizePhoneNumber(value) {
  const raw = clean(value, 40);
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("0")) return `+94${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("7")) return `+94${digits}`;
  if (digits.length === 11 && digits.startsWith("94")) return `+${digits}`;
  if (raw.startsWith("+") && digits) return `+${digits}`;
  return digits;
}

export function validateRsvp(payload) {
  const rawPhoneNumber = clean(payload?.phoneNumber, 40);
  const normalizedPhoneNumber = normalizePhoneNumber(rawPhoneNumber);
  const phoneDigits = normalizedPhoneNumber.replace(/\D/g, "");
  const spam = Boolean(clean(payload?.website, 180));
  const data = {
    event: clean(payload?.event, 20).toLowerCase(),
    fullName: clean(payload?.fullName, 120),
    phoneNumber: normalizedPhoneNumber,
    attending: clean(payload?.attending, 10).toLowerCase(),
    numberOfGuests: Number(payload?.numberOfGuests),
    message: clean(payload?.message, 800),
  };
  const errors = {};

  if (!allowedEvents.has(data.event)) errors.event = "Please choose a valid event.";
  if (data.fullName.length < 2) errors.fullName = "Please enter your full name.";
  if (!/^[+()\-\s\d]{7,40}$/.test(rawPhoneNumber) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phoneNumber = "Please enter a valid phone number.";
  }
  if (!["yes", "no"].includes(data.attending)) errors.attending = "Please let us know if you will attend.";

  if (data.attending === "yes") {
    if (!Number.isInteger(data.numberOfGuests) || data.numberOfGuests < 1 || data.numberOfGuests > 20) {
      errors.numberOfGuests = "Please enter the number of guests (1–20).";
    }
  } else if (data.attending === "no") {
    data.numberOfGuests = 0;
  }

  return { valid: Object.keys(errors).length === 0, data, errors, spam };
}
