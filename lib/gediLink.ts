import { getRouteById } from "@/data/routes";
import { getModeById } from "@/data/musicModes";

/**
 * Canonical shared-Gedi link builder/parser. Always validates against the
 * centralized route/mood configuration — never trusts a slug from the URL
 * without checking it first.
 */

export function getGediPath(routeId: string, modeId: string): string {
  return `/g/${routeId}/${modeId}`;
}

export function isValidGediCombo(
  routeId: string,
  modeId: string
): boolean {
  return Boolean(getRouteById(routeId)) && Boolean(getModeById(modeId));
}

/**
 * Full absolute URL for the given route/mood. Generated client-side using
 * the real page origin, so it's automatically a localhost URL in
 * development and the real production URL once deployed — no separate
 * "production URL" configuration needed.
 */
export function buildGediShareUrl(routeId: string, modeId: string): string {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}${getGediPath(routeId, modeId)}`;
}
