"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Copy, Download, Loader2, Share2, X } from "lucide-react";
import type { Route } from "@/data/routes";
import type { MusicMode } from "@/data/musicModes";
import GediPassTicket from "./GediPassTicket";
import GediPassExportCanvas, { EXPORT_PIXEL_RATIO } from "./GediPassExportCanvas";
import GediPassDetailsForm from "./GediPassDetailsForm";
import { buildGediShareUrl } from "@/lib/gediLink";
import { generatePassReference } from "@/lib/passReference";
import { exportPassImage, passDownloadFilename } from "@/lib/ticketExport";
import { copyGediLink, downloadBlob, isNativeShareSupported, shareGedi } from "@/lib/share";
import {
  loadStoredDriverDetails,
  pickRandomCar,
  saveStoredDriverDetails,
} from "@/lib/driverPass";
import { track } from "@/lib/analytics";

interface GediPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: Route;
  mode: MusicMode;
  trackTitle: string;
  trackArtist: string;
}

type CopyState = "idle" | "copied" | "failed";
type ShareState = "idle" | "sharing" | "shared" | "failed";
type ExportStatus = "generating" | "ready" | "failed";
type DownloadState = "idle" | "downloaded";

export default function GediPassModal({
  isOpen,
  onClose,
  route,
  mode,
  trackTitle,
  trackArtist,
}: GediPassModalProps) {
  const prefersReducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Fresh every time the pass is (re)opened for this route/mode — derived
  // during render rather than synced via an effect, and used as the `key`
  // below so each open mounts an all-new GediPassContent instance instead
  // of needing to manually reset its internal state.
  const passRef = useMemo(
    () => (isOpen ? generatePassReference(route.id, mode.id) : ""),
    [isOpen, route.id, mode.id]
  );

  // Open lifecycle: lock scroll, move focus in, restore it on close, and
  // track the open event.
  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    track("gedi_pass_opened", { route: route.id, mood: mode.id });

    return () => {
      document.body.style.overflow = originalOverflow;
      previouslyFocusedRef.current?.focus?.();
    };
  }, [isOpen, route.id, mode.id]);

  // Focus trap + Escape-to-close.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const overlay = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gedi-pass-heading"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: "easeOut" }}
            className="flex max-h-[92dvh] w-full max-w-md flex-col overflow-y-auto rounded-t-2xl bg-gedi-charcoal pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-[0_-20px_60px_rgba(0,0,0,0.6)] sm:max-h-[88dvh] sm:rounded-2xl sm:pt-0"
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2 sm:px-6 sm:pt-6">
              <h2
                id="gedi-pass-heading"
                className="text-xs font-bold tracking-[0.25em] text-gedi-offwhite/70"
              >
                GEDI PASS
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-11 w-11 items-center justify-center rounded-full text-gedi-offwhite/70 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>

            {passRef && (
              <GediPassContent
                key={passRef}
                route={route}
                mode={mode}
                trackTitle={trackTitle}
                trackArtist={trackArtist}
                passRef={passRef}
                onClose={onClose}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(overlay, document.body) : null;
}

interface GediPassContentProps {
  route: Route;
  mode: MusicMode;
  trackTitle: string;
  trackArtist: string;
  passRef: string;
  onClose: () => void;
}

// Everything that should reset fresh on each pass open lives here, keyed by
// passRef from the parent — remounting replaces manual effect-driven resets.
function GediPassContent({
  route,
  mode,
  trackTitle,
  trackArtist,
  passRef,
  onClose,
}: GediPassContentProps) {
  const exportNodeRef = useRef<HTMLDivElement>(null);
  const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const downloadResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shareResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFallbackInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"details" | "ticket">("details");
  // Prefilled from whatever was entered earlier this session (sessionStorage
  // only — never persisted permanently, never sent anywhere). Read once via
  // lazy initializer rather than an effect, since this is a plain derived
  // starting value, not a sync with an external system.
  const [driverName, setDriverName] = useState(() => loadStoredDriverDetails()?.driverName ?? "");
  const [car, setCar] = useState(() => loadStoredDriverDetails()?.car ?? "");
  const [carIsGediPick, setCarIsGediPick] = useState(false);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [exportStatus, setExportStatus] = useState<ExportStatus>("generating");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [shareState, setShareState] = useState<ShareState>("idle");
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [canNativeShare] = useState(isNativeShareSupported);

  const departsLabel = useMemo(
    () => new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true }),
    []
  );
  const shareUrl = buildGediShareUrl(route.id, mode.id);
  const hostname = typeof window !== "undefined" ? window.location.host : "gedimode.app";

  const handleDetailsSubmit = (name: string, carInput: string) => {
    const isGediPick = carInput.length === 0;
    setDriverName(name);
    setCar(isGediPick ? pickRandomCar() : carInput);
    setCarIsGediPick(isGediPick);
    saveStoredDriverDetails({ driverName: name, car: carInput });
    setStep("ticket");
  };

  // Pre-generate the share image once the ticket step is showing — by the
  // time an effect runs, React has already committed and laid out the
  // export node, so no extra rAF/timer delay is needed (and none that
  // could stall in a backgrounded/throttled tab). SHARE GEDI can then
  // attach the file directly from the click instead of generating it on
  // demand. `attempt` lets DOWNLOAD PASS retry after a failure without a
  // full remount.
  const [exportAttempt, setExportAttempt] = useState(0);
  useEffect(() => {
    if (step !== "ticket") return;
    let cancelled = false;
    const node = exportNodeRef.current;
    if (!node) {
      setExportStatus("failed");
      return;
    }
    setExportStatus("generating");
    exportPassImage(node, EXPORT_PIXEL_RATIO).then((blob) => {
      if (cancelled) return;
      if (blob) {
        setExportBlob(blob);
        setExportStatus("ready");
      } else {
        setExportStatus("failed");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [step, exportAttempt]);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
      if (downloadResetTimerRef.current) clearTimeout(downloadResetTimerRef.current);
      if (shareResetTimerRef.current) clearTimeout(shareResetTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (copyState === "failed") {
      copyFallbackInputRef.current?.focus();
      copyFallbackInputRef.current?.select();
    }
  }, [copyState]);

  // Fires once the ticket is actually generated from valid details — never
  // on mount, since reaching the details step isn't the same as a pass
  // having been produced. No driver/car data is ever included.
  useEffect(() => {
    if (step !== "ticket") return;
    track("gedi_pass_generated", { route: route.id, mood: mode.id, passRef });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const shareText = `I'm on a ${mode.name} ${route.name} Gedi. Join the ride.`;

  const handleShare = async () => {
    track("share_clicked", { route: route.id, mood: mode.id, passRef, source: "pass_modal" });
    setShareState("sharing");
    const file = exportBlob
      ? new File([exportBlob], passDownloadFilename(route.id, mode.id), { type: "image/png" })
      : undefined;
    const result = await shareGedi({ title: "GEDI MODE", text: shareText, url: shareUrl, file });

    if (shareResetTimerRef.current) clearTimeout(shareResetTimerRef.current);

    if (result === "shared") {
      track("native_share_completed", { route: route.id, mood: mode.id, passRef });
      setShareState("shared");
      shareResetTimerRef.current = setTimeout(() => setShareState("idle"), 2200);
    } else if (result === "cancelled") {
      // Cancellation is not an error — return to idle silently.
      track("share_cancelled", { route: route.id, mood: mode.id, passRef });
      setShareState("idle");
    } else {
      setShareState("failed");
      shareResetTimerRef.current = setTimeout(() => setShareState("idle"), 2800);
    }
  };

  const handleCopyLink = async () => {
    const succeeded = await copyGediLink(shareUrl);
    setCopyState(succeeded ? "copied" : "failed");
    if (copyResetTimerRef.current) clearTimeout(copyResetTimerRef.current);
    if (succeeded) {
      track("copy_link_completed", { route: route.id, mood: mode.id, passRef });
      copyResetTimerRef.current = setTimeout(() => setCopyState("idle"), 2200);
    }
    // On failure, copyState stays "failed" — the selectable fallback field
    // (rendered below) stays visible until the user copies it themselves
    // or closes the pass, rather than silently reverting.
  };

  const handleDownload = () => {
    if (exportStatus === "failed") {
      setExportAttempt((attempt) => attempt + 1);
      return;
    }
    if (exportStatus !== "ready" || !exportBlob) return;
    downloadBlob(exportBlob, passDownloadFilename(route.id, mode.id));
    track("pass_downloaded", { route: route.id, mood: mode.id, passRef });
    setDownloadState("downloaded");
    if (downloadResetTimerRef.current) clearTimeout(downloadResetTimerRef.current);
    downloadResetTimerRef.current = setTimeout(() => setDownloadState("idle"), 2200);
  };

  if (step === "details") {
    return (
      <GediPassDetailsForm
        initialDriverName={driverName}
        initialCar={car}
        onSubmit={handleDetailsSubmit}
        onCancel={onClose}
      />
    );
  }

  return (
    <div className="flex flex-col items-center px-5 pb-6 sm:px-6">
      <GediPassTicket
        route={route}
        mode={mode}
        trackTitle={trackTitle}
        trackArtist={trackArtist}
        driverName={driverName}
        car={car}
        carIsGediPick={carIsGediPick}
        passRef={passRef}
        shareUrl={shareUrl}
        hostname={hostname}
        departsLabel={departsLabel}
      />

      <div className="mt-6 flex w-full flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setStep("details")}
          className="min-h-[36px] text-center text-[10px] font-semibold tracking-[0.18em] text-gedi-offwhite/45 transition-colors hover:text-gedi-amber"
        >
          EDIT DETAILS
        </button>

        {canNativeShare && (
          <button
            type="button"
            onClick={handleShare}
            disabled={shareState === "sharing"}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gedi-amber px-6 text-xs font-bold tracking-[0.18em] text-gedi-black transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            {shareState === "sharing" ? (
              <Loader2 size={15} strokeWidth={2.25} className="animate-spin" aria-hidden="true" />
            ) : shareState === "shared" ? (
              <Check size={15} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Share2 size={15} strokeWidth={2.25} aria-hidden="true" />
            )}
            {shareState === "sharing"
              ? "SHARING…"
              : shareState === "shared"
                ? "GEDI SHARED"
                : shareState === "failed"
                  ? "COULDN'T SHARE — TRY BELOW"
                  : "SHARE GEDI"}
          </button>
        )}

        <div className="w-full">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-gedi-offwhite/25 px-6 text-xs font-bold tracking-[0.18em] text-gedi-offwhite transition-colors duration-200 hover:border-gedi-amber hover:text-gedi-amber"
          >
            {copyState === "copied" ? (
              <Check size={15} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Copy size={15} strokeWidth={2.25} aria-hidden="true" />
            )}
            {copyState === "copied" ? "GEDI LINK COPIED" : "COPY LINK"}
          </button>

          {copyState === "failed" && (
            <div className="mt-2">
              <label
                htmlFor="gedi-link-fallback"
                className="block text-[10px] font-semibold tracking-[0.15em] text-gedi-offwhite/50"
              >
                SELECT AND COPY THIS LINK
              </label>
              <input
                ref={copyFallbackInputRef}
                id="gedi-link-fallback"
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(event) => event.target.select()}
                className="mt-1 min-h-11 w-full rounded-lg border border-gedi-offwhite/20 bg-black/30 px-3 text-xs text-gedi-offwhite"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={exportStatus === "generating"}
          aria-disabled={exportStatus === "generating"}
          className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border border-gedi-offwhite/25 px-6 text-xs font-bold tracking-[0.18em] text-gedi-offwhite transition-colors duration-200 hover:border-gedi-amber hover:text-gedi-amber disabled:cursor-wait disabled:opacity-40 disabled:hover:border-gedi-offwhite/25 disabled:hover:text-gedi-offwhite"
        >
          {exportStatus === "generating" ? (
            <Loader2 size={15} strokeWidth={2.25} className="animate-spin" aria-hidden="true" />
          ) : downloadState === "downloaded" ? (
            <Check size={15} strokeWidth={2.5} aria-hidden="true" />
          ) : (
            <Download size={15} strokeWidth={2.25} aria-hidden="true" />
          )}
          {exportStatus === "generating"
            ? "PREPARING PASS…"
            : exportStatus === "failed"
              ? "COULDN'T GENERATE — RETRY"
              : downloadState === "downloaded"
                ? "GEDI PASS DOWNLOADED"
                : "DOWNLOAD PASS"}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-1 min-h-[44px] w-full text-center text-[11px] font-semibold tracking-[0.18em] text-gedi-offwhite/50 transition-colors hover:text-gedi-offwhite"
        >
          NOT NOW
        </button>
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {copyState === "copied" && "Gedi link copied"}
        {shareState === "shared" && "Gedi shared"}
        {shareState === "failed" && "Couldn't share — copy link or download the pass instead"}
        {downloadState === "downloaded" && "Gedi pass downloaded"}
        {exportStatus === "failed" && "Couldn't generate the pass image — tap download to retry"}
      </p>

      {/* Off-screen export target: kept in the DOM (not display:none) so
          html-to-image can measure and rasterize real layout, positioned
          far outside the viewport instead of visually hidden. */}
      <div style={{ position: "fixed", top: 0, left: "-9999px" }} aria-hidden="true">
        <GediPassExportCanvas
          ref={exportNodeRef}
          data={{
            route,
            mode,
            trackTitle,
            trackArtist,
            driverName,
            car,
            carIsGediPick,
            passRef,
            shareUrl,
            hostname,
            departsLabel,
          }}
        />
      </div>
    </div>
  );
}
