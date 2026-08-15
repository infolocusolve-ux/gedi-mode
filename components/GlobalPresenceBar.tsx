"use client";

import LivePresencePill from "./LivePresencePill";

// Mounted once at the root layout so it persists across every screen —
// splash, route/mode selection, shared invitation, the driving dashboard,
// and the profile page — without ever remounting the underlying Presence
// subscription (that lives in PresenceProvider, also mounted once at the
// root). This wrapper only handles fixed top-center placement.
//
// `pointer-events-none` on the wrapper means this can never intercept a
// click meant for the nav menu, GEDI Pass modal, form inputs, or anything
// else underneath it, regardless of viewport width — the pill itself has
// no interactive behavior, so nothing needs pointer events re-enabled.
export default function GlobalPresenceBar() {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.1rem)" }}
    >
      <LivePresencePill />
    </div>
  );
}
