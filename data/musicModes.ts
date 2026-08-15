/**
 * Single authoritative source for every mood: display labels, Gurmukhi
 * names, descriptions, accent colors, and the YouTube playlist each mood
 * plays. Every playlist ID below was verified live (loaded
 * youtube.com/playlist?list=... and confirmed the title/video count
 * match) before being added here. Do not duplicate this data elsewhere —
 * components should always read through `musicModes`.
 */

export type ModeId =
  | "aujla-mode"
  | "diljit-mode"
  | "arjan-mode"
  | "gedi-bangers"
  | "late-night"
  | "kalle-hi-theek-aa"
  | "purani-yaadan";

export type ModeAccent = "amber" | "taillight" | "midnight" | "offwhite";

export interface MusicMode {
  id: ModeId;
  name: string;
  gurmukhiName?: string;
  description: string;
  accent: ModeAccent;
  youtubePlaylistId: string;
  youtubePlaylistUrl: string;
}

export const musicModes: MusicMode[] = [
  {
    id: "aujla-mode",
    name: "Aujla Mode",
    description: "No skips. Full confidence.",
    accent: "amber",
    youtubePlaylistId: "PLL6anTM5WUQg",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLL6anTM5WUQg",
  },
  {
    id: "diljit-mode",
    name: "Diljit Mode",
    description: "For when the vibe needs no introduction.",
    accent: "taillight",
    youtubePlaylistId: "PLCauL51KwyIA",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLCauL51KwyIA",
  },
  {
    id: "arjan-mode",
    name: "Arjan Mode",
    description: "Lyrics. Mood. Late-night Punjab.",
    accent: "midnight",
    youtubePlaylistId: "PLIS-bmw8_4Mg",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLIS-bmw8_4Mg",
  },
  {
    id: "gedi-bangers",
    name: "Gedi Bangers",
    description: "Only tracks that sound better in a car.",
    accent: "amber",
    youtubePlaylistId: "PLb1L65c0kxmQ",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLb1L65c0kxmQ",
  },
  {
    id: "late-night",
    name: "Late Night",
    description: "Slow roads. Loud thoughts.",
    accent: "midnight",
    youtubePlaylistId: "PLNS0TdWlhI18",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLNS0TdWlhI18",
  },
  {
    id: "kalle-hi-theek-aa",
    name: "Kalle Hi Theek Aa",
    gurmukhiName: "ਕੱਲੇ ਹੀ ਠੀਕ ਆ",
    description: "No explanation needed.",
    accent: "taillight",
    youtubePlaylistId: "PLYxDhCFC4gJM",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLYxDhCFC4gJM",
  },
  {
    id: "purani-yaadan",
    name: "Purani Yaadan",
    gurmukhiName: "ਪੁਰਾਣੀਆਂ ਯਾਦਾਂ",
    description: "Back when every song had a memory.",
    accent: "offwhite",
    youtubePlaylistId: "PLUkgjaIdA9SQ",
    youtubePlaylistUrl: "https://www.youtube.com/playlist?list=PLUkgjaIdA9SQ",
  },
];

export function getModeById(modeId: string): MusicMode | undefined {
  return musicModes.find((mode) => mode.id === modeId);
}
