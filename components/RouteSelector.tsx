"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Landmark, Route as RouteIcon, Wheat } from "lucide-react";
import { routes, type Route, type RouteIconKey } from "@/data/routes";

const ADVANCE_DELAY_MS = 280;

const ROUTE_ICONS: Record<RouteIconKey, typeof Landmark> = {
  landmark: Landmark,
  building: Building2,
  wheat: Wheat,
  route: RouteIcon,
};

interface RouteSelectorProps {
  selectedRouteId: string | null;
  onSelect: (route: Route) => void;
  onAdvance: () => void;
}

export default function RouteSelector({
  selectedRouteId,
  onSelect,
  onAdvance,
}: RouteSelectorProps) {
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [supportsHover, setSupportsHover] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Only autoplay a card's preview on devices that actually hover (mouse);
  // touch devices only ever get the selected/tapped card playing.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handler = (e: MediaQueryListEvent) => setSupportsHover(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Play only the selected card, plus the hovered/focused card on
  // hover-capable devices — never all four at once.
  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      const shouldPlay =
        id === selectedRouteId || (supportsHover && id === activeId);
      if (shouldPlay) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeId, selectedRouteId, supportsHover]);

  const handleSelect = (route: Route) => {
    if (isAdvancing) return;
    onSelect(route);
    setIsAdvancing(true);
    timerRef.current = setTimeout(() => {
      onAdvance();
    }, ADVANCE_DELAY_MS);
  };

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-x-hidden bg-gedi-black">
      <div className="shrink-0 px-6 pt-12 pb-4 text-center sm:pt-14 md:pt-16 xl:pt-20">
        <h2
          lang="pa"
          className="font-gurmukhi text-2xl font-bold tracking-wide text-gedi-offwhite sm:text-3xl md:text-5xl xl:text-7xl"
        >
          ਕਿੱਥੋਂ ਗੇੜੀ ਮਾਰਨੀ ਆ?
        </h2>
        <p className="mt-1 text-sm font-semibold tracking-[0.15em] text-gedi-offwhite/70 sm:text-base md:mt-2 md:text-lg xl:text-2xl">
          KITHON GEDI MAARNI AA?
        </p>
        <p className="mt-1 hidden text-xs font-medium tracking-wide text-gedi-offwhite/55 xl:mt-3 xl:block xl:text-sm">
          Choose your route
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center-safe overflow-y-auto px-4 py-4 pb-6">
        <div
          className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3 md:max-w-2xl md:gap-5 xl:max-w-[1140px] xl:grid-cols-4 xl:gap-6"
          aria-busy={isAdvancing}
        >
          {routes.map((route) => {
            const isSelected = route.id === selectedRouteId;
            const Icon = ROUTE_ICONS[route.icon];
            return (
              <button
                key={route.id}
                type="button"
                aria-pressed={isSelected}
                disabled={isAdvancing && !isSelected}
                onClick={() => handleSelect(route)}
                onMouseEnter={() => setActiveId(route.id)}
                onMouseLeave={() =>
                  setActiveId((id) => (id === route.id ? null : id))
                }
                onFocus={() => setActiveId(route.id)}
                onBlur={() =>
                  setActiveId((id) => (id === route.id ? null : id))
                }
                className={`group relative aspect-[3/4] overflow-hidden rounded-sm border transition-[border-color,box-shadow,transform] duration-300 md:aspect-[4/5] xl:aspect-auto xl:h-[340px] ${
                  isSelected
                    ? "border-gedi-amber shadow-[0_10px_34px_rgba(201,138,68,0.3)]"
                    : "border-white/10 hover:border-gedi-amber/50 hover:shadow-[0_8px_28px_rgba(201,138,68,0.2)]"
                } ${isAdvancing && !isSelected ? "opacity-40" : ""}`}
                style={{
                  transform:
                    isSelected && isAdvancing ? "scale(1.035)" : "scale(1)",
                }}
              >
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(route.id, el);
                    else videoRefs.current.delete(route.id);
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                  src={route.videoPath}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-hidden="true"
                />
                <div
                  className={`absolute inset-0 bg-black/50 transition-colors duration-300 group-hover:bg-black/30 ${
                    isSelected ? "bg-black/20" : ""
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

                <div
                  className="pointer-events-none absolute inset-x-0 top-[32%] flex justify-center text-gedi-offwhite/80"
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.7))" }}
                >
                  <Icon
                    strokeWidth={1.5}
                    className="h-6 w-6 md:h-9 md:w-9 xl:h-12 xl:w-12"
                    aria-hidden="true"
                  />
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, boxShadow: "0 0 0 0 rgba(201,138,68,0)" }}
                    animate={{
                      opacity: 1,
                      boxShadow: "inset 0 0 0 2px rgba(201,138,68,0.9)",
                    }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0"
                  />
                )}

                {isSelected && (
                  <motion.div
                    initial={{ x: "-120%", opacity: 0 }}
                    animate={{ x: "120%", opacity: [0, 0.35, 0] }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 p-3 text-center sm:p-4 xl:p-5">
                  <p
                    lang="pa"
                    className="font-gurmukhi hidden text-sm font-semibold text-gedi-offwhite/75 xl:block"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
                  >
                    {route.gurmukhiName}
                  </p>
                  <p
                    className="text-sm font-bold tracking-wide text-gedi-offwhite sm:text-base xl:mt-0.5 xl:text-[28px]"
                    style={{ textShadow: "0 1px 6px rgba(0,0,0,0.8)" }}
                  >
                    {route.name}
                  </p>
                  <p
                    className="mt-1 hidden text-xs leading-snug text-gedi-offwhite/80 sm:block xl:text-base"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,0.9)" }}
                  >
                    {route.shortDescription}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
