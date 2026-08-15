"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { Route } from "@/data/routes";
import { routes, getRouteById } from "@/data/routes";
import type { MusicMode } from "@/data/musicModes";
import { musicModes, getModeById } from "@/data/musicModes";
import SplashScreen from "@/components/SplashScreen";
import RouteSelector from "@/components/RouteSelector";
import ModeSelector from "@/components/ModeSelector";
import DriveScene from "@/components/DriveScene";
import GediInvite from "@/components/GediInvite";
import { usePresenceContext } from "@/lib/presence/PresenceProvider";
import { track } from "@/lib/analytics";

type Screen = "splash" | "route" | "mode" | "drive" | "invite";
type EntrySource = "normal" | "surprise" | "shared";

const LAST_GEDI_STORAGE_KEY = "gedi-last-combo";

interface GediAppProps {
  /** Present when this app was reached via a shared /g/[routeSlug]/[modeSlug] link. */
  sharedRouteId?: string;
  sharedModeId?: string;
}

export default function GediApp({ sharedRouteId, sharedModeId }: GediAppProps) {
  const prefersReducedMotion = useReducedMotion();
  const { updatePresence } = usePresenceContext();

  // Resolved once from the (already validated by the route handler) slugs —
  // never trusted further than a lookup against the centralized configs.
  const sharedRoute = sharedRouteId ? getRouteById(sharedRouteId) : undefined;
  const sharedMode = sharedModeId ? getModeById(sharedModeId) : undefined;
  const hasSharedInvite = Boolean(sharedRoute && sharedMode);

  const [currentScreen, setCurrentScreen] = useState<Screen>(
    hasSharedInvite ? "invite" : "splash"
  );
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(sharedRoute ?? null);
  const [selectedMode, setSelectedMode] = useState<MusicMode | null>(sharedMode ?? null);
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const entrySourceRef = useRef<EntrySource>("normal");

  useEffect(() => {
    if (hasSharedInvite && sharedRoute && sharedMode) {
      track("shared_gedi_opened", { route: sharedRoute.id, mood: sharedMode.id, shared: true });
    }
    // Only ever meaningful on first mount for a given shared link.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The scroll container (this root div) persists across screen changes —
  // only its children swap via AnimatePresence — so without this, a screen
  // reached while scrolled down (e.g. a short landscape viewport) would
  // leak that scroll offset into the next screen instead of starting fresh.
  useEffect(() => {
    scrollRootRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [currentScreen]);

  // Keeps the shared presence payload in sync with what this visitor is
  // actually doing — no separate heartbeat/polling, just a track() call
  // whenever the stage/route/mood genuinely changes.
  useEffect(() => {
    updatePresence({
      stage: currentScreen,
      route: selectedRoute?.id,
      mood: selectedMode?.id,
    });
  }, [currentScreen, selectedRoute, selectedMode, updatePresence]);

  const goToRoute = useCallback(() => {
    track("start_gedi_clicked", { source: "splash" });
    setCurrentScreen("route");
  }, []);

  const goToMode = useCallback(() => setCurrentScreen("mode"), []);

  const goToDrive = useCallback(() => {
    entrySourceRef.current = "normal";
    setCurrentScreen("drive");
  }, []);

  // Fires once the dashboard is actually revealed (playback settled), not
  // at click time — a more accurate "the drive actually started" signal.
  const handleDriveRevealed = useCallback(() => {
    if (selectedRoute && selectedMode) {
      track("gedi_started", {
        route: selectedRoute.id,
        mood: selectedMode.id,
        source: entrySourceRef.current,
      });
    }
  }, [selectedRoute, selectedMode]);

  // Dashboard navigation: revise a selection or restart without losing
  // context that should be kept. Navigating away from "drive" unmounts
  // DriveScene's whole subtree, which cleanly destroys the YouTube player
  // (CarStereoPlayer's own cleanup effect) — no duplicate players/audio.
  const changeMood = useCallback(() => setCurrentScreen("mode"), []);
  const changeRoute = useCallback(() => setCurrentScreen("route"), []);
  const startOver = useCallback(() => {
    setSelectedRoute(null);
    setSelectedMode(null);
    setCurrentScreen("splash");
  }, []);

  const handleSelectRoute = useCallback((route: Route) => {
    setSelectedRoute(route);
    track("route_selected", { route: route.id });
  }, []);

  const handleSelectMode = useCallback((mode: MusicMode) => {
    setSelectedMode(mode);
    track("mood_selected", { mood: mode.id });
  }, []);

  const startThisGedi = useCallback(() => {
    if (!selectedRoute || !selectedMode) return;
    track("shared_gedi_started", {
      route: selectedRoute.id,
      mood: selectedMode.id,
      shared: true,
    });
    entrySourceRef.current = "shared";
    setCurrentScreen("drive");
  }, [selectedRoute, selectedMode]);

  const chooseMyOwn = useCallback(() => {
    track("shared_gedi_choose_own");
    setSelectedRoute(null);
    setSelectedMode(null);
    setCurrentScreen("route");
    // Replaces the address bar's /g/[route]/[mood] with / so a refresh
    // lands on the normal flow instead of re-showing the rejected
    // invitation. Uses the History API directly rather than the Next.js
    // router: router.replace("/") would navigate to a different route
    // tree entirely, remounting GediApp fresh on the splash screen instead
    // of keeping this instance on route selection.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/");
    }
  }, []);

  // Random valid route+mood, avoiding an immediate repeat of the
  // last-used combo when another option exists. No recommendation
  // logic — a flat, evenly-weighted pick from every valid combination.
  const surpriseMe = useCallback(() => {
    let lastCombo: string | null = null;
    try {
      lastCombo = window.localStorage.getItem(LAST_GEDI_STORAGE_KEY);
    } catch {
      // localStorage unavailable (private mode, etc.) — proceed without memory.
    }

    const combos = routes.flatMap((route) =>
      musicModes.map((mode) => `${route.id}:${mode.id}`)
    );
    const alternatives = combos.filter((combo) => combo !== lastCombo);
    const pool = alternatives.length > 0 ? alternatives : combos;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const [routeId, modeId] = pick.split(":");
    const route = getRouteById(routeId);
    const mode = getModeById(modeId);
    if (!route || !mode) return;

    try {
      window.localStorage.setItem(LAST_GEDI_STORAGE_KEY, pick);
    } catch {
      // Non-fatal — Surprise Me still works without persisted memory.
    }

    track("surprise_me_clicked", { route: route.id, mood: mode.id });
    entrySourceRef.current = "surprise";
    setSelectedRoute(route);
    setSelectedMode(mode);
    setCurrentScreen("drive");
  }, []);

  // Overlapping crossfade: incoming and outgoing screens animate at the
  // same time (no AnimatePresence "wait" gap), and the incoming screen
  // starts from a visible opacity floor so it never reads as disabled
  // mid-transition. Reduced motion drops the translate and shortens the
  // fade to a quick crossfade instead of the full cinematic move.
  const screenTransition = prefersReducedMotion
    ? {
        initial: { opacity: 0.6 },
        animate: { opacity: 1 },
        exit: { opacity: 0, pointerEvents: "none" as const },
        transition: { duration: 0.15, ease: "easeInOut" as const },
      }
    : {
        initial: { opacity: 0.5, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6, pointerEvents: "none" as const },
        transition: { duration: 0.35, ease: "easeInOut" as const },
      };

  return (
    <div
      ref={scrollRootRef}
      className="relative h-dvh w-full overflow-x-hidden overflow-y-auto bg-gedi-black"
    >
      {/* Warms the browser cache for the selected route's drive video ahead of the drive screen mounting */}
      {selectedRoute && currentScreen !== "drive" && (
        <link
          rel="preload"
          href={selectedRoute.videoPath}
          as="video"
          type="video/mp4"
        />
      )}

      <AnimatePresence initial={false}>
        {currentScreen === "invite" && selectedRoute && selectedMode && (
          <motion.div
            key="invite"
            className="absolute inset-x-0 top-0 min-h-full"
            {...screenTransition}
          >
            <GediInvite
              route={selectedRoute}
              mode={selectedMode}
              onStart={startThisGedi}
              onChooseOwn={chooseMyOwn}
            />
          </motion.div>
        )}

        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            className="absolute inset-x-0 top-0 min-h-full"
            {...screenTransition}
          >
            <SplashScreen onStart={goToRoute} onSurpriseMe={surpriseMe} />
          </motion.div>
        )}

        {currentScreen === "route" && (
          <motion.div
            key="route"
            className="absolute inset-x-0 top-0 min-h-full"
            {...screenTransition}
          >
            <RouteSelector
              selectedRouteId={selectedRoute?.id ?? null}
              onSelect={handleSelectRoute}
              onAdvance={goToMode}
            />
          </motion.div>
        )}

        {currentScreen === "mode" && (
          <motion.div
            key="mode"
            className="absolute inset-x-0 top-0 min-h-full"
            {...screenTransition}
          >
            <ModeSelector
              selectedModeId={selectedMode?.id ?? null}
              onSelect={handleSelectMode}
              onStart={goToDrive}
            />
          </motion.div>
        )}

        {currentScreen === "drive" && selectedRoute && selectedMode && (
          <motion.div
            key="drive"
            className="absolute inset-0"
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: prefersReducedMotion ? 0.15 : 0.5, ease: "easeInOut" }}
          >
            <DriveScene
              route={selectedRoute}
              mode={selectedMode}
              onChangeMood={changeMood}
              onChangeRoute={changeRoute}
              onStartOver={startOver}
              onRevealed={handleDriveRevealed}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
