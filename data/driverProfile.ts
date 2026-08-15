/**
 * MOCK DATA LAYER — no backend, auth, or profile system exists in this
 * project yet (verified: static Next.js App Router frontend only). This
 * module is a clearly isolated stand-in so the "Who's driving?" button and
 * /profile/[username] route have something real and stable to render.
 *
 * To connect a real backend: replace `getCurrentDriver()` and
 * `getDriverByUsername()` below with real lookups (DB call, API route,
 * auth session, etc). Every consumer (DriverButton, the profile route)
 * only depends on the DriverProfile type, so no UI changes are required
 * once real data is wired in.
 */

export interface DriverProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
  city?: string;
  currentRoute?: string;
  currentMood?: string;
  isDriving: boolean;
  instagramUrl?: string;
  spotifyUrl?: string;
}

const MOCK_DRIVER: DriverProfile = {
  id: "driver-1",
  username: "hardeep_gedi",
  displayName: "Hardeep",
  bio: "Runs the late-night Chandigarh loop most weekends. Amber lights, low volume, long way round.",
  city: "Mohali, Punjab",
  currentRoute: "Chandigarh",
  currentMood: "Late Night",
  isDriving: true,
};

/** Stable demo driver — the one currently "driving" the featured Gedi. */
export function getCurrentDriver(): DriverProfile {
  return MOCK_DRIVER;
}

/** Stable demo lookup — returns undefined for any username that isn't the mock driver. */
export function getDriverByUsername(username: string): DriverProfile | undefined {
  return username === MOCK_DRIVER.username ? MOCK_DRIVER : undefined;
}
