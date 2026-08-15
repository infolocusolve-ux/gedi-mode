import Image from "next/image";

// The icon is the official Locusolve mark, extracted from the brand's own
// header logo asset at https://locusolve.com/ (see public/brand/README —
// downloaded and cropped locally, never hotlinked). White fill, reads
// cleanly against the dark interface with no recoloring.
export default function LocusolveAttribution() {
  return (
    <a
      href="https://locusolve.com/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Visit Locusolve website"
      className="group flex h-11 items-center gap-2 rounded-full border border-gedi-offwhite/15 bg-black/35 pl-2.5 pr-3 backdrop-blur-md transition-colors duration-300 hover:border-gedi-amber/50 hover:bg-black/45 focus-visible:border-gedi-amber active:scale-[0.98]"
    >
      <Image
        src="/brand/locusolve-icon.svg"
        alt=""
        aria-hidden="true"
        width={11}
        height={24}
        className="h-[22px] w-auto shrink-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:h-[24px]"
      />
      <span className="flex flex-col items-start leading-tight">
        <span className="hidden text-[8px] font-medium tracking-[0.16em] text-gedi-offwhite/55 sm:block sm:text-[9px]">
          POWERED BY
        </span>
        <span className="text-[10px] font-bold tracking-[0.06em] text-gedi-offwhite transition-colors duration-300 group-hover:text-gedi-amber sm:text-[11px]">
          LOCUSOLVE
        </span>
      </span>
    </a>
  );
}
