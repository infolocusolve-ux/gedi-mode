"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "./supabaseClient";
import { getAnonymousId } from "@/lib/anonymousId";
import { track } from "@/lib/analytics";

export type PresenceStatus = "connecting" | "live" | "fallback";

export interface PresencePayload {
  stage: string;
  route?: string;
  mood?: string;
}

interface PresenceContextValue {
  status: PresenceStatus;
  count: number;
  updatePresence: (payload: PresencePayload) => void;
}

const PresenceContext = createContext<PresenceContextValue>({
  status: "fallback",
  count: 0,
  updatePresence: () => {},
});

export function usePresenceContext(): PresenceContextValue {
  return useContext(PresenceContext);
}

const CHANNEL_NAME = "gedi-global-presence-v1";

// Safety net only — if we never get confirmation that our own presence key
// made it into the synced state (dropped track() call, unusual Realtime
// hiccup), stop showing "connecting" forever and settle on the neutral
// fallback instead. Normal connections resolve in well under this.
const CONNECT_TIMEOUT_MS = 8000;

function devWarn(message: string, detail?: unknown): void {
  if (process.env.NODE_ENV !== "development") return;
  console.warn(`[presence] ${message}`, detail ?? "");
}

/**
 * Mounts a single Supabase Realtime Presence channel for the whole app.
 * If presence env vars aren't configured, degrades to a "fallback" status
 * so the rest of the app keeps working (see supabaseClient.ts).
 */
export function PresenceProvider({ children }: { children: ReactNode }) {
  // Lazy initializer: whether presence is configured at all is known
  // synchronously (env vars present or not), so the "fallback" status can
  // be set on first render instead of via a setState call inside the effect.
  const [status, setStatus] = useState<PresenceStatus>(() =>
    getSupabaseClient() ? "connecting" : "fallback"
  );
  const [count, setCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const payloadRef = useRef<PresencePayload>({ stage: "splash" });

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const anonymousId = getAnonymousId();
    const channel = supabase.channel(CHANNEL_NAME, {
      config: { presence: { key: anonymousId } },
    });

    const connectTimeout = setTimeout(() => {
      if (cancelled) return;
      setStatus((prev) => {
        if (prev !== "connecting") return prev;
        devWarn("never confirmed in synced presence state — falling back");
        return "fallback";
      });
    }, CONNECT_TIMEOUT_MS);

    // Only ever counted once our own key is actually present in the
    // synced state — this is what guarantees the number shown always
    // includes "you" and never flashes 0 or an undercount before your
    // own track() has round-tripped through Realtime.
    channel.on("presence", { event: "sync" }, () => {
      if (cancelled) return;
      const state = channel.presenceState();
      const keys = Object.keys(state);
      if (!keys.includes(anonymousId)) return;
      clearTimeout(connectTimeout);
      setCount(keys.length);
      setStatus("live");
    });

    channel.subscribe((subStatus) => {
      if (cancelled) return;

      if (subStatus === "SUBSCRIBED") {
        // Presence key is tracked only after the channel confirms it's
        // actually subscribed — never speculatively before that.
        channel
          .track({ ...payloadRef.current, connectedAt: new Date().toISOString() })
          .then((result) => {
            if (result !== "ok") devWarn("track() did not resolve ok", result);
          })
          .catch((error) => devWarn("track() failed", error));
        track("live_presence_connected");
        return;
      }

      if (
        subStatus === "CHANNEL_ERROR" ||
        subStatus === "TIMED_OUT" ||
        subStatus === "CLOSED"
      ) {
        devWarn(`subscription status: ${subStatus}`);
        // Only fall back if we never successfully connected. A transient
        // blip after being live shouldn't flip a real count back to the
        // fallback label — the client auto-retries underneath us.
        setStatus((prev) => (prev === "connecting" ? "fallback" : prev));
      }
    });

    channelRef.current = channel;

    return () => {
      cancelled = true;
      clearTimeout(connectTimeout);
      channelRef.current = null;
      channel.untrack().catch(() => {});
      supabase.removeChannel(channel);
    };
  }, []);

  const updatePresence = (payload: PresencePayload) => {
    payloadRef.current = payload;
    const channel = channelRef.current;
    if (!channel) return;
    channel
      .track({ ...payload, connectedAt: new Date().toISOString() })
      .catch(() => {});
  };

  return (
    <PresenceContext.Provider value={{ status, count, updatePresence }}>
      {children}
    </PresenceContext.Provider>
  );
}
