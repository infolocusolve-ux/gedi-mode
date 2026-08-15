/**
 * Cleans a raw YouTube upload title (e.g. "SOFTLY (Official Music Video)
 * KARAN AUJLA | IKKY | LATEST PUNJABI SONGS 2023") down to a "friendly"
 * display title (e.g. "SOFTLY") for the ticket — display purposes only,
 * the raw title is still what's used everywhere else.
 */
export function getFriendlyTrackTitle(rawTitle: string): string {
  const title = rawTitle?.trim();
  if (!title) return "Untitled";

  const markers = ["(", "[", " | ", " - "]
    .map((marker) => title.indexOf(marker))
    .filter((index) => index > 1);

  if (markers.length === 0) return title;

  const cut = title.slice(0, Math.min(...markers)).trim();
  return cut.length >= 2 ? cut : title;
}
