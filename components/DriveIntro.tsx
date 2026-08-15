"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { DRIVE_INTRO_SRC } from "@/data/media";

interface DriveIntroProps {
  routeName: string;
  modeName: string;
}

type Stage = "ignition" | "selection" | "ready";

const STAGE_DURATIONS: Record<Stage, number> = {
  ignition: 300,
  selection: 650,
  ready: 650,
};

// Purely a visual overlay now: plays its staged entrance once, then holds
// at "ready" indefinitely. It has no completion timer of its own — the
// parent (DriveScene) removes it from the tree once real playback has
// actually started (or been blocked/timed out), so the dashboard and
// audible music always arrive together. See DriveScene for the gating
// logic that controls when this unmounts.
export default function DriveIntro({ routeName, modeName }: DriveIntroProps) {
  const prefersReducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("ignition");

  useEffect(() => {
    if (prefersReducedMotion) return;

    const order: Stage[] = ["ignition", "selection", "ready"];
    const index = order.indexOf(stage);
    if (index >= order.length - 1) return;

    const timer = setTimeout(() => setStage(order[index + 1]), STAGE_DURATIONS[stage]);
    return () => clearTimeout(timer);
  }, [stage, prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-gedi-black px-6"
    >
      {/* Exterior vehicle shot — visible from the first frame, never plain black */}
      {!prefersReducedMotion && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={DRIVE_INTRO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
      <div className="film-grain" />

      {!prefersReducedMotion && stage === "ready" && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 50% at 50% 55%, rgba(201,138,68,0.35), transparent 70%)",
            }}
          />
          <motion.div
            initial={{ x: "-140%", opacity: 0 }}
            animate={{ x: "140%", opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-gedi-offwhite/25 to-transparent"
          />
        </>
      )}

      <div aria-live="polite" className="relative z-10">
        {prefersReducedMotion ? (
          <motion.p
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="text-xl font-extrabold tracking-[0.15em] text-gedi-offwhite sm:text-2xl"
          >
            GEDI MODE ON
          </motion.p>
        ) : (
          <AnimatePresence mode="wait">
            {stage === "selection" && (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-center"
              >
                <p className="text-lg font-bold tracking-wide text-gedi-offwhite sm:text-xl">
                  {routeName}
                </p>
                <p className="mt-2 text-sm font-medium tracking-wide text-gedi-amber/90">
                  {modeName}
                </p>
              </motion.div>
            )}

            {stage === "ready" && (
              <motion.p
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="text-xl font-extrabold tracking-[0.15em] text-gedi-offwhite sm:text-2xl"
              >
                GEDI MODE ON
              </motion.p>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
