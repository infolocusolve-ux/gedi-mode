/**
 * Short, display-only pass reference — no database record, nothing
 * sensitive. Derived from the route slug, mood slug, and creation time,
 * plus a short random suffix for a bit of uniqueness between passes for
 * the same route+mood.
 */
export function generatePassReference(
  routeId: string,
  modeId: string,
  createdAt: Date = new Date()
): string {
  const routePart = routeId.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  const modePart = modeId.replace(/[^a-z0-9]/gi, "").slice(0, 3).toUpperCase();
  const timePart = createdAt.getTime().toString(36).slice(-4).toUpperCase();
  const suffix = Math.random().toString(36).slice(2, 4).toUpperCase();

  return `GEDI-${routePart}${modePart}-${timePart}${suffix}`;
}
