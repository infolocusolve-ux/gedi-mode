/**
 * Centralized media configuration for the home-screen hero background and
 * the START GEDI ignition sequence.
 *
 * Flip the matching *_AVAILABLE flag back to false (and the fallback takes
 * over automatically) if an asset is ever removed. No other code changes
 * are required — every consumer reads the exported *_SRC constants below.
 */
export const HERO_VIDEO_AVAILABLE = true; // /public/scenes/hero-gedi-night(.mobile).mp4
export const INTRO_VIDEO_AVAILABLE = true; // /public/scenes/intro-thar-night.mp4

const HERO_VIDEO_DESKTOP_PATH = "/scenes/hero-gedi-night.mp4";
const HERO_VIDEO_MOBILE_PATH = "/scenes/hero-gedi-night-mobile.mp4";
const HERO_POSTER_PATH = "/scenes/hero-gedi-night-poster.png";
const INTRO_VIDEO_PATH = "/scenes/intro-thar-night.mp4";
const FALLBACK_VIDEO_PATH = "/scenes/route-highway-night.mp4";

/** Matches the <source media="(max-width: …px)"> breakpoint used for the mobile hero cut. */
export const HERO_MOBILE_BREAKPOINT_PX = 640;

export const SPLASH_HERO_DESKTOP_SRC = HERO_VIDEO_AVAILABLE
  ? HERO_VIDEO_DESKTOP_PATH
  : FALLBACK_VIDEO_PATH;

export const SPLASH_HERO_MOBILE_SRC = HERO_VIDEO_AVAILABLE
  ? HERO_VIDEO_MOBILE_PATH
  : FALLBACK_VIDEO_PATH;

/** Only a real poster once the dedicated hero asset exists — never fabricate one. */
export const SPLASH_HERO_POSTER = HERO_VIDEO_AVAILABLE ? HERO_POSTER_PATH : undefined;

/** The exterior vehicle shot used for the START GEDI ignition sequence. */
export const DRIVE_INTRO_SRC = INTRO_VIDEO_AVAILABLE
  ? INTRO_VIDEO_PATH
  : FALLBACK_VIDEO_PATH;
