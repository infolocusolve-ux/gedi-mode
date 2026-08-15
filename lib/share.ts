export type ShareResult = "shared" | "cancelled" | "unsupported" | "error";

interface SharePayload {
  title: string;
  text: string;
  url: string;
  file?: File;
}

export function isNativeShareSupported(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.share === "function";
}

export async function shareGedi(payload: SharePayload): Promise<ShareResult> {
  if (!isNativeShareSupported()) return "unsupported";

  const shareData: ShareData = {
    title: payload.title,
    text: payload.text,
    url: payload.url,
  };

  if (payload.file && navigator.canShare?.({ files: [payload.file] })) {
    shareData.files = [payload.file];
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    return "error";
  }
}

export async function copyGediLink(url: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Fall through to the legacy fallback below.
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = url;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
