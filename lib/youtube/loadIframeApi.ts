import type { YTNamespace } from "./types";

const YOUTUBE_IFRAME_API_SRC = "https://www.youtube.com/iframe_api";

let apiPromise: Promise<YTNamespace> | null = null;

/**
 * Loads the YouTube IFrame Player API script exactly once and resolves
 * with the YT namespace. Safe to call multiple times (multiple components,
 * or twice under React Strict Mode) — every caller shares the same
 * underlying promise/script tag.
 */
export function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("YouTube IFrame API is only available in the browser")
    );
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (apiPromise) {
    return apiPromise;
  }

  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      if (window.YT) resolve(window.YT);
    };

    const existingScript = document.querySelector(
      `script[src="${YOUTUBE_IFRAME_API_SRC}"]`
    );
    if (existingScript) {
      // Already requested elsewhere — onYouTubeIframeAPIReady above will
      // still fire once it finishes loading.
      return;
    }

    const script = document.createElement("script");
    script.src = YOUTUBE_IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => {
      apiPromise = null; // allow a later retry
      reject(new Error("Failed to load the YouTube IFrame API script"));
    };
    document.body.appendChild(script);
  });

  return apiPromise;
}
