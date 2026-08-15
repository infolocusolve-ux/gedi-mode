import { CarFront } from "lucide-react";

interface GediBrandLockupProps {
  subtitle?: string;
}

export default function GediBrandLockup({
  subtitle = "PUNJAB • AFTER DARK",
}: GediBrandLockupProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gedi-amber/90 sm:h-9 sm:w-9">
        <CarFront
          size={16}
          strokeWidth={2}
          className="text-gedi-black"
          aria-hidden="true"
        />
      </div>
      <div className="min-w-0">
        <p
          lang="pa"
          className="font-gurmukhi truncate text-lg font-bold leading-tight text-gedi-offwhite sm:text-xl md:text-2xl"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
        >
          ਗੇੜੀ ਮੋਡ
        </p>
        <p
          className="truncate text-[10px] font-medium tracking-[0.2em] text-gedi-offwhite/70 sm:text-[11px]"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.85)" }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}
