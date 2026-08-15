import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DriverProfile } from "@/data/driverProfile";

interface DriverButtonProps {
  driver: DriverProfile;
}

export default function DriverButton({ driver }: DriverButtonProps) {
  return (
    <Link
      href={`/profile/${driver.username}`}
      aria-label={`Who's driving — ${driver.displayName}. View driver profile.`}
      className="group flex h-11 items-center gap-2 rounded-full border border-gedi-offwhite/15 bg-black/35 pl-1 pr-3 backdrop-blur-md transition-colors duration-300 hover:border-gedi-amber/50 hover:bg-black/45 focus-visible:border-gedi-amber"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gedi-amber/40 bg-gedi-charcoal text-sm font-bold text-gedi-amber"
        aria-hidden="true"
      >
        {driver.displayName.charAt(0).toUpperCase()}
      </span>

      <span className="hidden leading-tight sm:block">
        <span lang="pa" className="font-gurmukhi block text-[10px] font-semibold text-gedi-offwhite/85">
          ਡਰਾਈਵਰ ਕੌਣ?
        </span>
        <span className="block text-[10px] font-medium tracking-[0.12em] text-gedi-offwhite/65">
          WHO&apos;S DRIVING?
        </span>
      </span>

      <ChevronRight
        size={15}
        strokeWidth={2}
        className="shrink-0 text-gedi-offwhite/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-gedi-amber"
        aria-hidden="true"
      />
    </Link>
  );
}
