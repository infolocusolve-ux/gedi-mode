"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePresenceContext } from "@/lib/presence/PresenceProvider";

export default function LivePresencePill() {
  const { status, count } = usePresenceContext();
  const prefersReducedMotion = useReducedMotion();

  const label =
    status === "connecting"
      ? "CONNECTING TO GEDI…"
      : status === "fallback"
        ? "GEDI LIVE"
        : `${count} ON GEDI`;

  const isPulsing = status === "live" && !prefersReducedMotion;

  return (
    <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 rounded-full border border-gedi-amber/25 bg-black/30 px-2.5 py-1.5 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2"
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
        {isPulsing && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gedi-amber opacity-60" />
        )}
        <span className="relative inline-flex h-2 w-2 rounded-full bg-gedi-amber" />
      </span>
      <motion.span
        key={label}
        initial={{ opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
        className="whitespace-nowrap font-mono text-[9px] font-semibold tracking-[0.08em] text-gedi-offwhite/85 sm:text-[10px] sm:tracking-[0.14em] lg:text-xs"
      >
        {label}
      </motion.span>
    </div>
  );
}
