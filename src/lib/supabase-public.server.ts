import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Vercel (and any host where runtime env vars aren't configured) does not read the
// repo .env at runtime, so fall back to the build-time inlined VITE_ values.
// Both values are publishable and safe to expose.
function resolveConfig() {
  const url =
    process.env["SUPABASE_URL"] ||
    import.meta.env["VITE_SUPABASE_URL"] ||
    "";
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    "";
  if (!url || !key) {
    throw new Error(
      "Missing backend configuration: set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or VITE_ equivalents) in your hosting environment.",
    );
  }
  return { url, key };
}

export function publicClient() {
  const { url, key } = resolveConfig();
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}
