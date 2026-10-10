export function readPreference(key, fallback = null) {
  try { return localStorage.getItem(`invitation-${key}`) ?? fallback; } catch { return fallback; }
}
export function savePreference(key, value) {
  try { localStorage.setItem(`invitation-${key}`, String(value)); } catch { /* Private browsing can deny storage. */ }
}
