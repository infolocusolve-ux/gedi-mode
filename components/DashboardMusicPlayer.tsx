"use client";

import { motion } from "framer-motion";
import type { MusicMode } from "@/data/musicModes";
import type { CarStereoStatus } from "@/lib/youtube/types";
import CarStereoPlayer from "./CarStereoPlayer";

interface DashboardMusicPlayerProps {
  mode: MusicMode;
  appearDelay?: number;
  onTrackChange?: (track: { title: string; artist: string } | null) => void;
  onStatusChange?: (status: CarStereoStatus) => void;
}

export default function DashboardMusicPlayer({
  mode,
  appearDelay = 0.4,
  onTrackChange,
  onStatusChange,
}: DashboardMusicPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: appearDelay, ease: "easeOut" }}
      className="w-[min(420px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-gedi-amber/15 bg-gradient-to-b from-[#1c1815] to-black/85 shadow-[0_14px_38px_rgba(0,0,0,0.65)] backdrop-blur-md lg:w-[min(630px,calc(100vw-64px))]"
    >
      {/* Amber strip along the top edge, like a stereo head-unit's power LED */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gedi-amber/70 to-transparent" />

      <div className="p-3 lg:p-4">
        <p className="pb-2 text-[10px] font-semibold tracking-[0.25em] text-gedi-offwhite/60 lg:text-xs">
          {mode.name.toUpperCase()} · GEDI STEREO
        </p>
        <CarStereoPlayer
          playlistId={mode.youtubePlaylistId}
          playlistUrl={mode.youtubePlaylistUrl}
          onTrackChange={onTrackChange}
          onStatusChange={onStatusChange}
        />
      </div>
    </motion.div>
  );
}
