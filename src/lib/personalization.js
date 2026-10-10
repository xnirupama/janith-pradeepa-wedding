export function sanitizeGuestName(value) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return "";

  const cleaned = candidate
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[<>\u202a-\u202e\u2066-\u2069]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40)
    .trim();

  return /[\p{L}\p{N}]/u.test(cleaned) ? cleaned : "";
}
