"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { loadYouTubeIframeApi } from "@/lib/youtube/loadIframeApi";
import { DEFAULT_VOLUME, loadStoredVolume, saveStoredVolume } from "@/lib/volumePreference";
import {
  YT_ERROR_CODE,
  YT_PLAYER_STATE,
  type CarStereoStatus,
  type YTPlayer,
} from "@/lib/youtube/types";

const INIT_TIMEOUT_MS = 8000;
const PROGRESS_POLL_MS = 500;
const AUTOPLAY_GRACE_MS = 1500;

interface NowPlayingTrack {
  videoId: string;
  title: string;
  channel: string;
}

interface CarStereoPlayerProps {
  playlistId: string;
  playlistUrl: string;
  onStatusChange?: (status: CarStereoStatus) => void;
  onTrackChange?: (track: { title: string; artist: string } | null) => void;
}

export default function CarStereoPlayer({
  playlistId,
  playlistUrl,
  onStatusChange,
  onTrackChange,
}: CarStereoPlayerProps) {
  const [status, setStatus] = useState<CarStereoStatus>("initializing");
  const [track, setTrack] = useState<NowPlayingTrack | null>(null);
  const [progress, setProgress] = useState({ position: 0, duration: 0 });
  const [retryCount, setRetryCount] = useState(0);
  const [volume, setVolumeState] = useState(() => loadStoredVolume());
  const [isMuted, setIsMutedState] = useState(false);

  // React owns this host; the actual mount point YouTube replaces with its
  // iframe is created imperatively inside it, so React's own reconciliation
  // never touches the node YouTube swaps out.
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const loadedPlaylistIdRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable snapshot of the restored volume, applied once when the player
  // becomes ready — the player-creation effect intentionally doesn't
  // depend on `volume` (that would recreate the iframe on every slider
  // move), so this ref is the one-time bridge between the two.
  const initialVolumeRef = useRef(volume);
  const lastNonZeroVolumeRef = useRef(volume > 0 ? volume : DEFAULT_VOLUME);

  const updateStatus = (next: CarStereoStatus) => {
    setStatus(next);
    onStatusChange?.(next);
  };

  const refreshTrackData = (player: YTPlayer) => {
    try {
      const data = player.getVideoData();
      if (data?.video_id) {
        const nextTrack = {
          videoId: data.video_id,
          title: data.title || "Untitled",
          channel: data.author || "",
        };
        setTrack(nextTrack);
        onTrackChange?.({ title: nextTrack.title, artist: nextTrack.channel });
      }
    } catch {
      // getVideoData can throw briefly during transitions — ignore.
    }
  };

  // Create the player. Intentionally unguarded against React Strict Mode's
  // dev-only double-invoke, matching the same pattern used elsewhere in
  // this app: the `cancelled` flag makes the first (immediately-cleaned-up)
  // pass a no-op, and the second pass creates the real, lasting player — a
  // ref-based "only run once" guard here would instead permanently skip
  // creation on Strict Mode's second (real) pass. `retryCount` is a
  // deliberate dependency: it only ever changes on an explicit user retry,
  // recreating the player from scratch after a total init failure.
  useEffect(() => {
    let cancelled = false;

    const host = hostRef.current;
    const mountPoint = host ? document.createElement("div") : null;
    if (host && mountPoint) host.appendChild(mountPoint);

    const timeoutId = setTimeout(() => {
      if (!cancelled) updateStatus("error");
    }, INIT_TIMEOUT_MS);

    loadYouTubeIframeApi()
      .then((YT) => {
        if (cancelled || !mountPoint) return;

        new YT.Player(mountPoint, {
          height: "1",
          width: "1",
          playerVars: {
            listType: "playlist",
            list: playlistId,
            controls: 0,
            disablekb: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            fs: 0,
            iv_load_policy: 3,
            enablejsapi: 1,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              clearTimeout(timeoutId);
              playerRef.current = event.target;
              loadedPlaylistIdRef.current = playlistId;
              updateStatus("ready");
              refreshTrackData(event.target);
              // Restore the visitor's saved volume level. This only
              // configures what level playback *would* be audible at —
              // it never forces sound on its own, so it can't fight
              // browser autoplay/mute policy either way.
              event.target.setVolume(initialVolumeRef.current);
              // Best-effort autoplay now that the page already has a user
              // gesture from START GEDI; browsers may still block it, in
              // which case an explicit "autoplay-blocked" status covers it.
              event.target.playVideo();
              hintTimerRef.current = setTimeout(() => {
                if (!cancelled) updateStatus("autoplay-blocked");
              }, AUTOPLAY_GRACE_MS);
            },
            onStateChange: (event) => {
              if (cancelled || event.data === undefined) return;
              refreshTrackData(event.target);

              if (event.data === YT_PLAYER_STATE.PLAYING) {
                if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
                updateStatus("playing");
              } else if (event.data === YT_PLAYER_STATE.PAUSED) {
                updateStatus("paused");
              } else if (event.data === YT_PLAYER_STATE.BUFFERING) {
                updateStatus("buffering");
              } else if (event.data === YT_PLAYER_STATE.CUED) {
                updateStatus("ready");
              }
            },
            onError: (event) => {
              if (cancelled) return;
              const code = event.data;
              const isUnavailable =
                code === YT_ERROR_CODE.NOT_FOUND ||
                code === YT_ERROR_CODE.EMBEDDING_DISALLOWED ||
                code === YT_ERROR_CODE.EMBEDDING_DISALLOWED_ALT;
              updateStatus(isUnavailable ? "unavailable" : "error");
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) updateStatus("error");
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      playerRef.current?.destroy();
      playerRef.current = null;
      mountPoint?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  // Load a new playlist into the *existing* player when the selected mode
  // changes, instead of recreating the iframe.
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (loadedPlaylistIdRef.current === playlistId) return;

    loadedPlaylistIdRef.current = playlistId;
    updateStatus("loading");
    player.loadPlaylist({ listType: "playlist", list: playlistId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlistId]);

  // Poll real playback position while playing.
  useEffect(() => {
    if (status !== "playing") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;
      setProgress({
        position: player.getCurrentTime() || 0,
        duration: player.getDuration() || 0,
      });
    }, PROGRESS_POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status]);

  const isPlaying = status === "playing";
  const isChangingTrack = status === "changing-track" || status === "buffering";
  const isBusy = status === "initializing" || status === "loading" || isChangingTrack;
  const progressPct =
    progress.duration > 0
      ? Math.min(100, (progress.position / progress.duration) * 100)
      : 0;

  const goToTrack = (direction: "previous" | "next") => {
    const player = playerRef.current;
    if (!player) return;
    updateStatus("changing-track");
    if (direction === "previous") player.previousVideo();
    else player.nextVideo();
  };

  // Slider drag to zero shows the muted visual state without needing a
  // separate explicit mute() call — setVolume(0) already fully silences
  // the existing player, so React state and the real player volume stay
  // in sync via this one path.
  const effectiveMuted = isMuted || volume === 0;

  const handleVolumeChange = (next: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(next)));
    setVolumeState(clamped);
    playerRef.current?.setVolume(clamped);
    saveStoredVolume(clamped);
    if (clamped > 0) {
      lastNonZeroVolumeRef.current = clamped;
      if (isMuted) {
        setIsMutedState(false);
        playerRef.current?.unMute();
      }
    }
  };

  const handleToggleMute = () => {
    if (effectiveMuted) {
      // Unmuting while the level itself is at zero restores the last
      // non-zero level the visitor had (or a sensible default) instead
      // of unmuting into silence.
      const restored = volume > 0 ? volume : lastNonZeroVolumeRef.current || DEFAULT_VOLUME;
      setIsMutedState(false);
      playerRef.current?.unMute();
      if (volume === 0) {
        setVolumeState(restored);
        playerRef.current?.setVolume(restored);
        saveStoredVolume(restored);
      }
    } else {
      lastNonZeroVolumeRef.current = volume;
      setIsMutedState(true);
      playerRef.current?.mute();
    }
  };

  if (status === "error" || status === "unavailable") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl bg-black/40 px-4 py-4 text-center lg:py-5">
        <p className="text-xs font-medium text-gedi-offwhite/80 lg:text-sm">
          {status === "unavailable"
            ? "This track isn't available right now."
            : "Unable to load the playlist."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {status === "unavailable" ? (
            <button
              type="button"
              onClick={() => goToTrack("next")}
              className="min-h-11 border border-gedi-offwhite/30 px-4 text-[11px] font-semibold tracking-[0.12em] text-gedi-offwhite transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber"
            >
              SKIP TRACK
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                updateStatus("initializing");
                setRetryCount((count) => count + 1);
              }}
              className="min-h-11 border border-gedi-offwhite/30 px-4 text-[11px] font-semibold tracking-[0.12em] text-gedi-offwhite transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber"
            >
              RETRY
            </button>
          )}
          <a
            href={playlistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center border border-gedi-offwhite/30 px-4 text-[11px] font-semibold tracking-[0.12em] text-gedi-offwhite transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber"
          >
            OPEN ON YOUTUBE
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Real YouTube player — kept technically present but visually negligible; the info and controls below are fully custom */}
      <div
        ref={hostRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
      />

      <div className="flex items-center gap-3 lg:gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/50 ring-1 ring-white/10 lg:h-[70px] lg:w-[70px]">
          {track ? (
            // eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail CDN, updates per track
            <img
              key={track.videoId}
              src={`https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full animate-pulse bg-white/5" />
          )}
          {isChangingTrack && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/45">
              <Loader2 size={16} strokeWidth={2} className="animate-spin text-gedi-amber" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gedi-offwhite lg:text-xl">
            {track?.title ?? "Loading track…"}
          </p>
          <p
            className={`truncate text-xs lg:text-sm ${isChangingTrack ? "font-semibold text-gedi-amber/90" : "text-gedi-offwhite/70"}`}
            aria-live="polite"
          >
            {isChangingTrack ? "Changing track…" : (track?.channel ?? "")}
          </p>

          <div
            role="progressbar"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={progress.duration}
            aria-valuenow={progress.position}
            className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10 lg:mt-2.5 lg:h-1.5"
          >
            <div
              className="h-full rounded-full bg-gedi-amber transition-[width] duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 lg:gap-2">
          <button
            type="button"
            onClick={() => goToTrack("previous")}
            disabled={isBusy}
            aria-label="Previous track"
            className="flex h-11 w-11 items-center justify-center text-gedi-offwhite/70 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber disabled:opacity-30 lg:h-12 lg:w-12"
          >
            <SkipBack size={16} strokeWidth={1.75} className="lg:hidden" />
            <SkipBack size={20} strokeWidth={1.75} className="hidden lg:block" />
          </button>
          <button
            type="button"
            onClick={() =>
              isPlaying
                ? playerRef.current?.pauseVideo()
                : playerRef.current?.playVideo()
            }
            disabled={isBusy}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gedi-offwhite/30 text-gedi-offwhite transition-colors hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber disabled:opacity-30 lg:h-14 lg:w-14"
          >
            {isPlaying ? (
              <>
                <Pause size={17} strokeWidth={1.75} className="lg:hidden" />
                <Pause size={24} strokeWidth={1.75} className="hidden lg:block" />
              </>
            ) : (
              <>
                <Play size={17} strokeWidth={1.75} className="translate-x-[1px] lg:hidden" />
                <Play size={24} strokeWidth={1.75} className="hidden translate-x-[1px] lg:block" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => goToTrack("next")}
            disabled={isBusy}
            aria-label="Next track"
            className="flex h-11 w-11 items-center justify-center text-gedi-offwhite/70 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber disabled:opacity-30 lg:h-12 lg:w-12"
          >
            <SkipForward size={16} strokeWidth={1.75} className="lg:hidden" />
            <SkipForward size={20} strokeWidth={1.75} className="hidden lg:block" />
          </button>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2 lg:mt-3 lg:gap-3">
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={effectiveMuted ? "Unmute" : "Mute"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gedi-offwhite/70 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber lg:h-9 lg:w-9"
        >
          {effectiveMuted ? (
            <VolumeX size={17} strokeWidth={1.75} />
          ) : (
            <Volume2 size={17} strokeWidth={1.75} />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={(event) => handleVolumeChange(Number(event.target.value))}
          aria-label="Music volume"
          className="h-1.5 flex-1 cursor-pointer accent-gedi-amber"
        />
      </div>

      {status === "autoplay-blocked" && (
        <p className="mt-1.5 text-center text-[10px] leading-snug text-gedi-offwhite/50 lg:text-xs">
          Tap play to start your Gedi playlist.
        </p>
      )}
    </div>
  );
}
