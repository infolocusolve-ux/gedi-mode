"use client";

import Image from "next/image";
import type { MusicMode } from "@/data/musicModes";
import type { CarStereoStatus } from "@/lib/youtube/types";
import DashboardMusicPlayer from "./DashboardMusicPlayer";

interface DashboardOverlayProps {
  mode: MusicMode;
  playerDelay?: number;
  onTrackChange?: (track: { title: string; artist: string } | null) => void;
  onStatusChange?: (status: CarStereoStatus) => void;
}

export default function DashboardOverlay({
  mode,
  playerDelay,
  onTrackChange,
  onStatusChange,
}: DashboardOverlayProps) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 h-[42%] sm:h-[38%] md:h-[34%] lg:h-[32%]">
      {/* Dashboard image: normal blending, only the top edge fades into the windshield */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 20%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 20%)",
        }}
      >
        <Image
          src="/overlays/dashboard-foreground.jpeg"
          alt=""
          fill
          className="object-cover object-bottom"
          sizes="100vw"
          quality={90}
          priority
        />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pb-[5%]">
        <DashboardMusicPlayer
          mode={mode}
          appearDelay={playerDelay}
          onTrackChange={onTrackChange}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
}
