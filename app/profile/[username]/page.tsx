import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, Music2, Music4 } from "lucide-react";
import { getDriverByUsername } from "@/data/driverProfile";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const driver = getDriverByUsername(username);
  return { title: driver ? `${driver.displayName} — GEDI MODE` : "Driver not found" };
}

// MOCK DATA: getDriverByUsername reads from the isolated mock layer in
// data/driverProfile.ts. This is local demo data only — no backend,
// auth, or profile database is connected. Swap the lookup there for a
// real backend query later; this page doesn't need to change.
export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const driver = getDriverByUsername(username);

  if (!driver) {
    notFound();
  }

  return (
    <div className="relative min-h-dvh w-full bg-gedi-black">
      <div
        className="h-40 w-full sm:h-52"
        style={
          driver.coverUrl
            ? {
                backgroundImage: `url(${driver.coverUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {
                background:
                  "radial-gradient(120% 140% at 30% 0%, #2a1710 0%, #150c08 55%, #050506 100%)",
              }
        }
      />
      <div className="film-grain" />

      <div className="mx-auto -mt-14 max-w-lg px-6 pb-16 sm:-mt-16">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gedi-black bg-gedi-charcoal text-3xl font-bold text-gedi-amber sm:h-28 sm:w-28 sm:text-4xl">
          {driver.displayName.charAt(0).toUpperCase()}
        </div>

        <div className="mt-4">
          <h1 className="text-2xl font-extrabold text-gedi-offwhite sm:text-3xl">
            {driver.displayName}
          </h1>
          <p className="mt-0.5 text-sm text-gedi-offwhite/50">
            @{driver.username}
          </p>
        </div>

        {driver.isDriving && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gedi-amber/40 bg-gedi-amber/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-gedi-amber animate-pulse" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide text-gedi-amber">
              Driving this Gedi
            </span>
          </div>
        )}

        {(driver.city || driver.currentRoute || driver.currentMood) && (
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gedi-offwhite/70">
            {driver.city && (
              <span className="flex items-center gap-1.5">
                <MapPin size={14} strokeWidth={1.75} aria-hidden="true" />
                {driver.city}
              </span>
            )}
            {driver.currentRoute && (
              <span className="flex items-center gap-1.5">
                <Music2 size={14} strokeWidth={1.75} aria-hidden="true" />
                {driver.currentRoute}
              </span>
            )}
            {driver.currentMood && (
              <span className="flex items-center gap-1.5">
                <Music4 size={14} strokeWidth={1.75} aria-hidden="true" />
                {driver.currentMood}
              </span>
            )}
          </div>
        )}

        {driver.bio && (
          <p className="mt-6 text-sm leading-relaxed text-gedi-offwhite/80">
            {driver.bio}
          </p>
        )}

        {(driver.instagramUrl || driver.spotifyUrl) && (
          <div className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4">
            {driver.instagramUrl && (
              <a
                href={driver.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${driver.displayName}'s Instagram`}
                className="text-gedi-offwhite/60 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber"
              >
                <ExternalLink size={18} strokeWidth={1.75} />
              </a>
            )}
            {driver.spotifyUrl && (
              <a
                href={driver.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${driver.displayName}'s Spotify`}
                className="text-gedi-offwhite/60 transition-colors hover:text-gedi-amber focus-visible:text-gedi-amber"
              >
                <Music2 size={18} strokeWidth={1.75} />
              </a>
            )}
          </div>
        )}

        <Link
          href="/"
          className="mt-10 inline-flex items-center gap-2 border border-gedi-offwhite/25 px-5 py-3 text-xs font-semibold tracking-[0.15em] text-gedi-offwhite transition-colors duration-300 hover:border-gedi-amber hover:text-gedi-amber focus-visible:border-gedi-amber"
        >
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          BACK TO GEDI
        </Link>
      </div>
    </div>
  );
}
