export function allowsBackgroundVideo({ reducedMotion = false, saveData = false, effectiveType, downlink } = {}) {
  return !reducedMotion && !saveData
    && !["slow-2g", "2g", "3g"].includes(effectiveType)
    && !(Number.isFinite(downlink) && downlink > 0 && downlink < 1.5);
}
