/**
 * Small typed analytics wrapper. No analytics provider exists in this
 * project yet, so this intentionally does NOT pull in a platform SDK —
 * it's a single place to plug one in later (Segment, PostHog, GA, etc.)
 * by replacing the `sink` function below. Every call is wrapped so a
 * failure here can never break the user experience.
 *
 * Privacy: only the properties listed in AnalyticsProperties are ever
 * sent. No PII, no presence UUIDs, no song titles/URLs.
 */

export type AnalyticsEvent =
  | "live_presence_connected"
  | "start_gedi_clicked"
  | "surprise_me_clicked"
  | "route_selected"
  | "mood_selected"
  | "gedi_started"
  | "gedi_pass_opened"
  | "gedi_pass_generated"
  | "share_clicked"
  | "native_share_completed"
  | "share_cancelled"
  | "copy_link_completed"
  | "pass_downloaded"
  | "shared_gedi_opened"
  | "shared_gedi_started"
  | "shared_gedi_choose_own";

export interface AnalyticsProperties {
  route?: string;
  mood?: string;
  source?: string;
  shared?: boolean;
  passRef?: string;
  viewport?: ViewportCategory;
}

export type ViewportCategory =
  | "mobile-portrait"
  | "mobile-landscape"
  | "tablet"
  | "desktop";

export function getViewportCategory(): ViewportCategory {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w >= 1024) return "desktop";
  if (w >= 640) return "tablet";
  return w > h ? "mobile-landscape" : "mobile-portrait";
}

function sink(event: AnalyticsEvent, properties: AnalyticsProperties): void {
  // No provider connected yet. Log in development only so the event
  // stream is easy to verify while wiring a real provider in here.
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", event, properties);
  }
}

export function track(
  event: AnalyticsEvent,
  properties: AnalyticsProperties = {}
): void {
  try {
    sink(event, { viewport: getViewportCategory(), ...properties });
  } catch {
    // Analytics must never break the app.
  }
}
