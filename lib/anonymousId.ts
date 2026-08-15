const STORAGE_KEY = "gedi-anonymous-id";

/**
 * A random, non-identifying UUID persisted in localStorage. Used only to
 * dedupe presence across multiple tabs in the same browser and as an
 * opaque "how many browsers" key — never sent anywhere as PII, never tied
 * to a real identity.
 */
export function getAnonymousId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    // Private browsing / storage disabled — fall back to a per-load id.
    // This just means this particular tab may count as its own visitor
    // for the duration of the session, which is an acceptable degradation.
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
