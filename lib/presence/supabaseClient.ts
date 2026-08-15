import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// undefined = not checked yet, null = env vars absent / client unavailable.
let cachedClient: SupabaseClient | null | undefined;

/**
 * Returns a shared Supabase client, or null if the (optional) presence
 * environment variables aren't configured. Only ever uses the client-safe
 * publishable key — never a secret/service-role key.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}
