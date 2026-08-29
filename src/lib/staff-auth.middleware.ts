import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Resolves backend config from runtime env, falling back to the build-time
// inlined publishable VITE_ values so hosts without runtime env vars still work.
function resolveConfig() {
  const url = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"] || "";
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

function supabaseFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) {
      new Headers(init.headers).forEach((value, name) => headers.set(name, value));
    }
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

export const requireAuthedUser = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { url, key } = resolveConfig();
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Unauthorized: please sign in again.");
  }
  const token = authHeader.slice("Bearer ".length);
  if (!token || token.split(".").length !== 3) {
    throw new Error("Unauthorized: please sign in again.");
  }

  const supabase = createClient<Database>(url, key, {
    global: {
      fetch: supabaseFetch(key),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    throw new Error("Unauthorized: please sign in again.");
  }

  return next({ context: { supabase, userId: data.claims.sub, claims: data.claims } });
});
