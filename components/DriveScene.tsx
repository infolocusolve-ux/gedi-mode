"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Ticket } from "lucide-react";
import type { Route } from "@/data/routes";
import type { MusicMode } from "@/data/musicModes";
import type { CarStereoStatus } from "@/lib/youtube/types";
import DashboardOverlay from "./DashboardOverlay";
import DriveNavMenu from "./DriveNavMenu";
import DriveIntro from "./DriveIntro";
import GediPassModal from "./GediPassModal";
import LocusolveAttribution from "./LocusolveAttribution";
import { getFriendlyTrackTitle } from "@/lib/trackTitle";

interface DriveSceneProps {
  route: Route;
  mode: MusicMode;
  onChangeMood: () => void;
  onChangeRoute: () => void;
  onStartOver: () => void;
  /** Fires once, the moment the dashboard is actually revealed (playing, blocked, or timed out). */
  onRevealed?: () => void;
}

// Once the player reaches any of these, playback has "settled" one way or
// another (it's actually making sound, or it's definitively not going to
// without a tap) — either is a valid moment to reveal the dashboard.
const SETTLED_STATUSES: CarStereoStatus[] = ["playing", "autoplay-blocked", "unavailable", "error"];

// A slightly longer cinematic transition beats a silent dashboard, but it
// still needs a floor (so a near-instant "ready" doesn't flash-cut) and a
// ceiling (so a stalled network can't trap the user on the intro forever).
const MIN_INTRO_MS = 1100;
const FALLBACK_REVEAL_MS = 4500;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function useLocalClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () =>
      setTime(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );

    update();
    const interval = setInterval(update, 1000 * 15);
    return () => clearInterval(interval);
  }, []);

  return time;
}

export default function DriveScene({
  route,
  mode,
  onChangeMood,
  onChangeRoute,
  onStartOver,
  onRevealed,
}: DriveSceneProps) {
  const time = useLocalClock();
  const [nowPlaying, setNowPlaying] = useState<{ title: string; artist: string } | null>(null);
  const [isPassOpen, setIsPassOpen] = useState(false);
  const [playerStatus, setPlayerStatus] = useState<CarStereoStatus>("initializing");
  const [dashboardRevealed, setDashboardRevealed] = useState(false);
  const mountTimeRef = useRef<number | null>(null);

  const openPass = useCallback(() => setIsPassOpen(true), []);
  const closePass = useCallback(() => setIsPassOpen(false), []);

  // The dashboard/music sync gate: reveal once the player has settled
  // (playing, blocked, unavailable, or errored) and at least MIN_INTRO_MS
  // has elapsed since this mounted — never before either condition, and
  // never later than FALLBACK_REVEAL_MS regardless of player state, so a
  // network or YouTube failure can't trap the user on the intro screen.
  useEffect(() => {
    if (mountTimeRef.current === null) {
      mountTimeRef.current = typeof performance !== "undefined" ? performance.now() : Date.now();
    }
    if (dashboardRevealed) return;

    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    const elapsed = now - mountTimeRef.current;
    const settled = SETTLED_STATUSES.includes(playerStatus);
    const deadline = settled ? MIN_INTRO_MS : FALLBACK_REVEAL_MS;
    const remaining = Math.max(0, deadline - elapsed);

    const timer = setTimeout(() => setDashboardRevealed(true), remaining);
    return () => clearTimeout(timer);
  }, [playerStatus, dashboardRevealed]);

  useEffect(() => {
    if (dashboardRevealed) onRevealed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardRevealed]);

  // Desktop "T" shortcut: ignored while typing, while a modifier is held,
  // on key repeat, or while the pass is already open.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "t" ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        event.shiftKey ||
        event.repeat ||
        isPassOpen ||
        isTypingTarget(event.target)
      ) {
        return;
      }
      // The pass modal auto-focuses a text input the moment it opens;
      // suppressing this keydown's default action stops the same "t"
      // keystroke from also being inserted into that field.
      event.preventDefault();
      openPass();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPassOpen, openPass]);

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-gedi-black">
      {/* Instant branded background — shows before the route video has a frame to paint, so a slow network never reads as a broken black screen */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 30%, #1a120b 0%, #0a0705 60%, #050506 100%)",
        }}
      />

      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={route.videoPath}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 35%, transparent 55%, rgba(0,0,0,0.4) 100%)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
      <div className="film-grain" />

      <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between px-5 pt-[calc(env(safe-area-inset-top)+0.9rem)] sm:px-8">
        <p
          className="text-xs font-semibold tracking-[0.2em] text-gedi-offwhite/90 sm:text-sm"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
        >
          {route.name.toUpperCase()}
        </p>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 xl:flex-nowrap">
          <button
            type="button"
            onClick={openPass}
            aria-label="Get Gedi Pass"
            className="group flex h-11 items-center justify-center gap-1.5 rounded-full border border-gedi-offwhite/20 bg-black/40 px-3 text-gedi-offwhite/85 backdrop-blur-md transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber sm:px-3.5"
          >
            <Ticket size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="hidden text-[10px] font-bold tracking-[0.15em] sm:inline sm:text-[11px]">
              GET GEDI PASS
            </span>
            <kbd className="hidden rounded border border-gedi-offwhite/25 px-1.5 py-0.5 text-[9px] font-semibold text-gedi-offwhite/50 group-hover:border-gedi-amber/40 lg:inline-block">
              T
            </kbd>
          </button>
          <p
            className="hidden text-xs font-semibold tabular-nums tracking-wide text-gedi-offwhite/90 sm:block sm:text-sm"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.9)" }}
            suppressHydrationWarning
          >
            {time}
          </p>
          <DriveNavMenu
            onChangeMood={onChangeMood}
            onChangeRoute={onChangeRoute}
            onStartOver={onStartOver}
          />
          {/* Below sm, this wraps onto its own right-aligned line — the
              pass/nav controls plus a centered fixed live counter already
              fill the row at narrow widths, so Locusolve gets a second line
              rather than crowding into the counter's space. At sm and up,
              `contents` unwraps it back into the single-line layout. */}
          <div className="flex basis-full justify-end xl:contents">
            <LocusolveAttribution />
          </div>
        </div>
      </div>

      <DashboardOverlay mode={mode} onTrackChange={setNowPlaying} onStatusChange={setPlayerStatus} />

      <AnimatePresence>
        {!dashboardRevealed && <DriveIntro key="intro" routeName={route.name} modeName={mode.name} />}
      </AnimatePresence>

      <GediPassModal
        isOpen={isPassOpen}
        onClose={closePass}
        route={route}
        mode={mode}
        trackTitle={nowPlaying ? getFriendlyTrackTitle(nowPlaying.title) : "Loading track…"}
        trackArtist={nowPlaying?.artist ?? ""}
      />
    </div>
  );
}
