"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  HERO_MOBILE_BREAKPOINT_PX,
  SPLASH_HERO_DESKTOP_SRC,
  SPLASH_HERO_MOBILE_SRC,
  SPLASH_HERO_POSTER,
} from "@/data/media";
import GediBrandLockup from "./GediBrandLockup";
import LocusolveAttribution from "./LocusolveAttribution";

interface SplashScreenProps {
  onStart: () => void;
  onSurpriseMe: () => void;
}

export default function SplashScreen({ onStart, onSurpriseMe }: SplashScreenProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative min-h-dvh w-full overflow-x-hidden bg-gedi-black">
      {/* Static gradient shows instantly, before the video/poster has a frame to paint */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, #201410 0%, #0c0705 60%, #050506 100%)",
        }}
      />

      {prefersReducedMotion && SPLASH_HERO_POSTER ? (
        <Image
          src={SPLASH_HERO_POSTER}
          alt=""
          aria-hidden="true"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay={!prefersReducedMotion}
          muted
          loop={!prefersReducedMotion}
          playsInline
          preload="metadata"
          poster={SPLASH_HERO_POSTER}
          aria-hidden="true"
        >
          <source
            src={SPLASH_HERO_MOBILE_SRC}
            media={`(max-width: ${HERO_MOBILE_BREAKPOINT_PX}px)`}
            type="video/mp4"
          />
          <source src={SPLASH_HERO_DESKTOP_SRC} type="video/mp4" />
        </video>
      )}

      {/* Warm sepia grading */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(40,22,12,0.4) 0%, rgba(20,12,8,0.25) 45%, rgba(12,7,5,0.55) 100%)",
        }}
      />
      {/* Top/bottom vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 75% at 50% 45%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-transparent to-black/80" />
      <div className="film-grain" />

      {/* Top-left brand identity. z-20: the main content stack below is a
          full-viewport flex container at the same stacking level; without
          a higher z-index here, its empty area would win hit-testing over
          this corner and silently swallow clicks even though nothing is
          visibly on top there. */}
      <div className="absolute top-5 left-5 z-20 max-w-[104px] sm:top-6 sm:left-6 sm:max-w-none lg:top-9 lg:left-9">
        <GediBrandLockup />
      </div>

      {/* Top-right Locusolve attribution */}
      <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-2 sm:top-6 sm:right-6 lg:top-9 lg:right-9">
        <LocusolveAttribution />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full flex-col items-center px-6 pt-[15vh] pb-10 text-center sm:pt-[13vh] [@media(max-height:760px)]:pt-10 [@media(max-height:760px)]:pb-6">
        <motion.p
          lang="pa"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
          style={{
            textShadow: "0 4px 28px rgba(0,0,0,0.85)",
            fontSize: "clamp(2.75rem, min(16vw, 22vh), 14rem)",
          }}
          className="font-gurmukhi font-black leading-[1.02] text-gedi-offwhite"
        >
          ਗੇੜੀ ਮੋਡ
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          style={{
            textShadow: "0 2px 14px rgba(0,0,0,0.8)",
            fontSize: "clamp(1.5rem, min(4vw, 6vh), 3.5rem)",
          }}
          className="mt-3 font-extrabold tracking-[0.18em] text-gedi-offwhite sm:mt-4 [@media(max-height:760px)]:mt-2"
        >
          GEDI MODE
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24, ease: "easeOut" }}
          className="mt-5 sm:mt-6 [@media(max-height:760px)]:mt-3"
        >
          <p
            lang="pa"
            className="font-gurmukhi text-sm font-medium text-gedi-offwhite/85 sm:text-base"
            style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
          >
            ਪੰਜਾਬ ਦੀਆਂ ਰਾਤਾਂ • ਨਾਨ-ਸਟਾਪ
          </p>
          <p
            style={{ fontSize: "clamp(0.75rem, 1.6vw, 1.125rem)" }}
            className="mt-1 font-semibold tracking-[0.2em] text-gedi-offwhite/70"
          >
            PUNJABI GEDI • NON-STOP
          </p>
        </motion.div>

        <motion.button
          type="button"
          onClick={onStart}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.36, ease: "easeOut" }}
          className="group relative mt-8 flex w-[clamp(200px,26vw,260px)] flex-col items-center justify-center gap-1 border border-gedi-offwhite/40 bg-black/15 px-6 py-4 text-center backdrop-blur-[1px] transition-all duration-300 hover:-translate-y-0.5 hover:border-gedi-amber hover:bg-[rgba(201,138,68,0.1)] hover:shadow-[0_10px_30px_rgba(201,138,68,0.35)] focus-visible:border-gedi-amber focus-visible:text-gedi-amber active:translate-y-0 active:scale-[0.98] sm:mt-9 lg:h-[clamp(76px,9vw,96px)] lg:w-[clamp(220px,22vw,260px)] [@media(max-height:760px)]:mt-5 [@media(max-height:760px)]:py-3 [@media(max-height:760px)]:lg:h-[clamp(64px,7vw,80px)]"
        >
          <span
            lang="pa"
            className="font-gurmukhi block text-base font-bold text-gedi-offwhite group-hover:text-gedi-amber sm:text-lg lg:text-2xl"
          >
            ਗੇੜੀ ਸ਼ੁਰੂ ਕਰੋ
          </span>
          <span className="block text-[10px] font-semibold tracking-[0.25em] text-gedi-offwhite/70 group-hover:text-gedi-amber/90 lg:text-xs">
            START GEDI
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={onSurpriseMe}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.42, ease: "easeOut" }}
          className="mt-3 min-h-[44px] px-3 py-2 text-[10px] font-semibold tracking-[0.22em] text-gedi-offwhite/55 underline decoration-gedi-offwhite/25 decoration-1 underline-offset-4 transition-colors duration-300 hover:text-gedi-amber hover:decoration-gedi-amber focus-visible:text-gedi-amber lg:text-[11px] [@media(max-height:760px)]:mt-1"
        >
          SURPRISE ME
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
          className="mt-2 text-[11px] font-medium tracking-wide text-gedi-offwhite/60 [@media(max-height:760px)]:mt-1"
        >
          Pick a route. Pick a mood. Start the drive.
        </motion.p>
      </div>
    </div>
  );
}
