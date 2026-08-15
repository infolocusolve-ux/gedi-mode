"use client";

import { useEffect, useRef } from "react";
import { Check, Music2 } from "lucide-react";
import { musicModes, type MusicMode, type ModeAccent } from "@/data/musicModes";

const accentColors: Record<ModeAccent, string> = {
  amber: "#c98a44",
  taillight: "#c96a61",
  midnight: "#84a2c4",
  offwhite: "#efe9e0",
};

interface ModeSelectorProps {
  selectedModeId: string | null;
  onSelect: (mode: MusicMode) => void;
  onStart: () => void;
}

export default function ModeSelector({
  selectedModeId,
  onSelect,
  onStart,
}: ModeSelectorProps) {
  const hasSelection = selectedModeId !== null;
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Keeps keyboard/screen-reader users oriented after route selection
    // auto-advances them here, without stealing focus disruptively.
    headingRef.current?.focus();
  }, []);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-gedi-black">
      <div className="shrink-0 px-6 pt-12 pb-4 sm:pt-14">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-center text-xl font-bold tracking-wide text-gedi-offwhite sm:text-2xl"
        >
          AJJ KI SUNNA?
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
        <div className="mx-auto flex max-w-2xl flex-col">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5">
            {musicModes.map((mode) => {
              const isSelected = mode.id === selectedModeId;
              const accent = accentColors[mode.accent];
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelect(mode)}
                  style={{
                    borderColor: isSelected
                      ? accent
                      : "rgba(255,255,255,0.08)",
                    borderWidth: isSelected ? "2px" : "1px",
                  }}
                  className="flex min-h-11 items-center gap-3 rounded-sm border bg-white/[0.03] px-4 py-3 text-left transition-colors duration-300 hover:border-white/25"
                >
                  <Music2
                    size={16}
                    strokeWidth={1.75}
                    style={{
                      color: isSelected ? accent : "rgba(239,233,224,0.55)",
                    }}
                    className="shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span
                        className="block truncate text-sm font-semibold tracking-wide"
                        style={{ color: isSelected ? accent : "#efe9e0" }}
                      >
                        {mode.name}
                      </span>
                      {mode.gurmukhiName && (
                        <span
                          lang="pa"
                          className="font-gurmukhi shrink-0 text-xs text-gedi-offwhite/60"
                        >
                          {mode.gurmukhiName}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gedi-offwhite/70">
                      {mode.description}
                    </span>
                  </span>
                  {isSelected && (
                    <Check
                      size={16}
                      strokeWidth={2.5}
                      style={{ color: accent }}
                      className="shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onStart}
            disabled={!hasSelection}
            aria-disabled={!hasSelection}
            className={`mx-auto mt-6 mb-4 block min-h-11 w-full max-w-xs border py-3.5 text-center text-sm font-semibold tracking-[0.2em] transition-colors duration-300 ${
              hasSelection
                ? "border-gedi-offwhite/40 text-gedi-offwhite hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber focus-visible:text-gedi-amber"
                : "cursor-not-allowed border-gedi-offwhite/10 text-gedi-offwhite/30"
            }`}
          >
            START GEDI
          </button>
        </div>
      </div>
    </div>
  );
}
