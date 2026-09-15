export function sanitizeGuestName(value) {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== "string") return "";

  const cleaned = candidate
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80)
    .trim();

  return /[\p{L}\p{N}]/u.test(cleaned) ? cleaned : "";
}
