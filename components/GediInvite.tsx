"use client";

import { motion } from "framer-motion";
import type { Route } from "@/data/routes";
import type { MusicMode } from "@/data/musicModes";
import GediBrandLockup from "./GediBrandLockup";

interface GediInviteProps {
  route: Route;
  mode: MusicMode;
  onStart: () => void;
  onChooseOwn: () => void;
}

// Recipient landing state for a shared /g/[routeSlug]/[modeSlug] link.
// Deliberately static (no autoplaying video) — playback only ever starts
// once the visitor explicitly chooses "Start This Gedi".
export default function GediInvite({ route, mode, onStart, onChooseOwn }: GediInviteProps) {
  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-gedi-black">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, #201410 0%, #0c0705 60%, #050506 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/75" />
      <div className="film-grain" />

      <div className="absolute top-5 left-5 z-20 max-w-[104px] sm:top-6 sm:left-6 sm:max-w-none lg:top-9 lg:left-9">
        <GediBrandLockup />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center justify-center px-6 py-16 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-[11px] font-bold tracking-[0.28em] text-gedi-amber sm:text-xs"
        >
          YOU&apos;VE BEEN INVITED TO A GEDI
        </motion.p>

        <motion.p
          lang="pa"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: "easeOut" }}
          className="font-gurmukhi mt-2 text-sm font-medium text-gedi-offwhite/70"
        >
          ਤੁਹਾਨੂੰ ਗੇੜੀ ਦਾ ਸੱਦਾ ਮਿਲਿਆ
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: "easeOut" }}
          style={{ textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}
          className="mt-6 text-3xl font-extrabold leading-tight text-gedi-offwhite sm:text-4xl lg:text-5xl"
        >
          {route.name}
          <span className="mx-2 text-gedi-offwhite/40">·</span>
          {mode.name}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.26, ease: "easeOut" }}
          className="mt-4 max-w-sm text-sm text-gedi-offwhite/65"
        >
          A gedi&apos;s waiting for you. Jump in and start the drive.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.36, ease: "easeOut" }}
          className="mt-9 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
        >
          <button
            type="button"
            onClick={onStart}
            className="min-h-[52px] w-full border border-gedi-offwhite/40 bg-black/15 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-gedi-offwhite backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-gedi-amber hover:bg-[rgba(201,138,68,0.1)] hover:text-gedi-amber hover:shadow-[0_10px_30px_rgba(201,138,68,0.35)] focus-visible:border-gedi-amber focus-visible:text-gedi-amber active:translate-y-0 active:scale-[0.98] sm:w-auto"
          >
            START THIS GEDI
          </button>
          <button
            type="button"
            onClick={onChooseOwn}
            className="min-h-[52px] w-full rounded-full border border-gedi-offwhite/20 px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-gedi-offwhite/60 transition-colors duration-300 hover:border-gedi-offwhite/45 hover:text-gedi-offwhite focus-visible:border-gedi-offwhite/45 focus-visible:text-gedi-offwhite sm:w-auto"
          >
            CHOOSE MY OWN
          </button>
        </motion.div>
      </div>
    </div>
  );
}
