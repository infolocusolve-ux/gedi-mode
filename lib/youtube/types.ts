/**
 * Typed surface for the YouTube IFrame Player API.
 * https://developers.google.com/youtube/iframe_api_reference
 *
 * Not published as an npm package — hand-authored from the documented API
 * surface, kept to what CarStereoPlayer actually uses rather than an
 * unstructured `any`.
 */

export const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type YTPlayerStateValue =
  (typeof YT_PLAYER_STATE)[keyof typeof YT_PLAYER_STATE];

/** https://developers.google.com/youtube/iframe_api_reference#onError */
export const YT_ERROR_CODE = {
  INVALID_PARAM: 2,
  HTML5_ERROR: 5,
  NOT_FOUND: 100,
  EMBEDDING_DISALLOWED: 101,
  EMBEDDING_DISALLOWED_ALT: 150,
} as const;

export interface YTVideoData {
  video_id: string;
  author: string;
  title: string;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

export interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  disablekb?: 0 | 1;
  playsinline?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
  enablejsapi?: 0 | 1;
  origin?: string;
  listType?: "playlist";
  list?: string;
}

export interface YTPlayerOptions {
  height?: string | number;
  width?: string | number;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
    onError?: (event: YTPlayerEvent) => void;
  };
}

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  nextVideo: () => void;
  previousVideo: () => void;
  playVideoAt: (index: number) => void;
  loadPlaylist: (options: { listType: "playlist"; list: string }) => void;
  cuePlaylist: (options: { listType: "playlist"; list: string }) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => YTVideoData;
  getPlaylistIndex: () => number;
  getPlayerState: () => YTPlayerStateValue;
  destroy: () => void;
}

export interface YTNamespace {
  Player: new (
    elementOrId: HTMLElement | string,
    options: YTPlayerOptions
  ) => YTPlayer;
  PlayerState: typeof YT_PLAYER_STATE;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Centralized playback state model.
 * - initializing: script/controller not created yet.
 * - loading: a full playlist (re)load is in flight.
 * - ready: controller created, first video cued, not yet started.
 * - playing / paused / buffering: normal YT playback states.
 * - changing-track: a user-triggered next/previous is in flight.
 * - autoplay-blocked: playback was attempted but the browser withheld it.
 * - unavailable: the current video specifically can't play (removed/private/region-locked).
 * - error: a recoverable failure (script blocked, init timeout, other player error).
 */
export type CarStereoStatus =
  | "initializing"
  | "loading"
  | "ready"
  | "playing"
  | "paused"
  | "buffering"
  | "changing-track"
  | "autoplay-blocked"
  | "unavailable"
  | "error";
