const STORAGE_KEY = "gedi-volume-preference";

export const DEFAULT_VOLUME = 70;

export function loadStoredVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_VOLUME;
    const parsed = Number(raw);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 100) return parsed;
    return DEFAULT_VOLUME;
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function saveStoredVolume(volume: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(volume));
  } catch {
    // Unavailable (private mode, quota) — non-fatal, just skips restoring next time.
  }
}
