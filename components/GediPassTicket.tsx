import { forwardRef } from "react";
import { CarFront } from "lucide-react";
import type { Route } from "@/data/routes";
import type { MusicMode } from "@/data/musicModes";
import GediQRCode from "./GediQRCode";

export interface GediPassTicketData {
  route: Route;
  mode: MusicMode;
  trackTitle: string;
  trackArtist: string;
  driverName: string;
  car: string;
  carIsGediPick: boolean;
  passRef: string;
  shareUrl: string;
  hostname: string;
  departsLabel: string;
}

interface GediPassTicketProps extends GediPassTicketData {
  className?: string;
}

const GediPassTicket = forwardRef<HTMLDivElement, GediPassTicketProps>(
  function GediPassTicket(
    {
      route,
      mode,
      trackTitle,
      trackArtist,
      driverName,
      car,
      carIsGediPick,
      passRef,
      shareUrl,
      hostname,
      departsLabel,
      className,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={`relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-gedi-offwhite text-gedi-ink shadow-[0_24px_60px_rgba(0,0,0,0.55)] ${className ?? ""}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gedi-ink">
              <CarFront size={16} strokeWidth={2} className="text-gedi-amber" aria-hidden="true" />
            </div>
            <div>
              <p className="font-gurmukhi text-sm font-bold leading-tight">ਗੇੜੀ ਪਾਸ</p>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-gedi-ink/70">
                GEDI PASS
              </p>
            </div>
          </div>
          <p className="mt-1 text-[10px] font-bold tracking-[0.25em] text-gedi-taillight">
            NIGHT SERVICE
          </p>
        </div>

        {/* Route + mood */}
        <div className="mt-5 grid grid-cols-2 gap-4 px-6">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">ROUTE</p>
            <p className="mt-0.5 truncate text-base font-extrabold leading-snug">{route.name}</p>
            <p className="font-gurmukhi truncate text-xs text-gedi-ink/60">{route.gurmukhiName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">MOOD</p>
            <p className="mt-0.5 truncate text-base font-extrabold leading-snug">{mode.name}</p>
            {mode.gurmukhiName && (
              <p className="font-gurmukhi truncate text-xs text-gedi-ink/60">{mode.gurmukhiName}</p>
            )}
          </div>
        </div>

        {/* Perforation */}
        <div className="relative my-5 h-0">
          <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full bg-gedi-black" />
          <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full bg-gedi-black" />
          <div className="mx-6 border-t-2 border-dashed border-gedi-ink/20" />
        </div>

        {/* Now playing */}
        <div className="px-6">
          <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">NOW PLAYING</p>
          <p className="mt-0.5 truncate text-sm font-bold leading-snug">{trackTitle}</p>
          <p className="truncate text-xs text-gedi-ink/60">{trackArtist}</p>
        </div>

        {/* Driver / car */}
        <div className="mt-4 grid grid-cols-2 gap-4 px-6">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">DRIVER</p>
            <p className="mt-0.5 truncate text-sm font-extrabold leading-snug">{driverName}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">CAR</p>
            <p className="mt-0.5 truncate text-sm font-extrabold leading-snug">{car}</p>
            {carIsGediPick && (
              <p className="mt-0.5 text-[8px] font-bold tracking-[0.2em] text-gedi-taillight/80">
                GEDI PICK
              </p>
            )}
          </div>
        </div>

        {/* Departs / pass ref */}
        <div className="mt-3 grid grid-cols-2 gap-4 px-6">
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">DEPARTS</p>
            <p className="mt-0.5 truncate text-xs font-bold tabular-nums">{departsLabel}</p>
          </div>
          <div>
            <p className="text-[9px] font-bold tracking-[0.25em] text-gedi-ink/50">PASS</p>
            <p className="mt-0.5 truncate text-xs font-bold">{passRef}</p>
          </div>
        </div>

        {/* QR + footer */}
        <div className="mt-5 flex items-end justify-between gap-4 border-t-2 border-dashed border-gedi-ink/20 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-gedi-ink/70">
              {hostname}
            </p>
            <p className="mt-2 text-[9px] font-bold tracking-[0.25em] text-gedi-ink/40">
              RIDER COPY
            </p>
          </div>
          <GediQRCode value={shareUrl} size={84} className="shrink-0 rounded-md ring-4 ring-gedi-offwhite" />
        </div>
      </div>
    );
  }
);

export default GediPassTicket;
