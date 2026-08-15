import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRouteById } from "@/data/routes";
import { getModeById } from "@/data/musicModes";
import { isValidGediCombo } from "@/lib/gediLink";
import GediApp from "@/components/GediApp";

interface SharedGediPageProps {
  params: Promise<{ routeSlug: string; modeSlug: string }>;
}

export async function generateMetadata({
  params,
}: SharedGediPageProps): Promise<Metadata> {
  const { routeSlug, modeSlug } = await params;
  const route = getRouteById(routeSlug);
  const mode = getModeById(modeSlug);

  if (!route || !mode) {
    return { title: "GEDI MODE" };
  }

  return {
    title: `You're invited to a Gedi — ${route.name} · ${mode.name}`,
    description: "Someone's invited you to a GEDI. Join the ride.",
  };
}

// A shared Gedi link never gets its own dashboard or player — it renders
// the same GediApp everything else does, pre-seeded with the route/mood
// from the URL. Invalid or unrecognized slugs never reach that state:
// they're never trusted past a lookup against the centralized route/mode
// configs, and fall back to the normal landing screen instead of crashing.
export default async function SharedGediPage({ params }: SharedGediPageProps) {
  const { routeSlug, modeSlug } = await params;

  if (!isValidGediCombo(routeSlug, modeSlug)) {
    redirect("/");
  }

  return <GediApp sharedRouteId={routeSlug} sharedModeId={modeSlug} />;
}
