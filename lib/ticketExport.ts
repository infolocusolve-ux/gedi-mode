import { toBlob } from "html-to-image";

/**
 * Renders a DOM node to a PNG Blob for sharing/downloading. Returns null on
 * failure instead of throwing — callers keep link-sharing available even
 * when image export isn't possible (e.g. unsupported browser).
 */
export async function exportPassImage(
  node: HTMLElement,
  pixelRatio: number
): Promise<Blob | null> {
  try {
    return await toBlob(node, { pixelRatio, cacheBust: true });
  } catch {
    return null;
  }
}

export function passDownloadFilename(routeId: string, modeId: string): string {
  return `gedi-pass-${routeId}-${modeId}.png`;
}
