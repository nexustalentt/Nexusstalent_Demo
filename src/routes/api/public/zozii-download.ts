import { createFileRoute } from "@tanstack/react-router";
import { publicClient } from "@/lib/supabase-public.server";

const FALLBACK_URL =
  "https://github.com/nexustalentt/ZOZII/releases/download/v1.09.01/DTDC.Service.Setup.exe";

/** Resolve a GitHub release *tag* page to the first .exe asset download URL. */
async function resolveTagUrl(url: string): Promise<string> {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/releases\/tag\/([^/?#]+)/,
  );
  if (!match) return url;
  const [, owner, repo, tag] = match;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`,
    { headers: { Accept: "application/vnd.github+json", "User-Agent": "zozii-site" } },
  );
  if (!res.ok) return url;
  const release = (await res.json()) as {
    assets?: Array<{ name: string; browser_download_url: string }>;
  };
  const exe =
    release.assets?.find((a) => a.name.toLowerCase().endsWith(".exe")) ??
    release.assets?.[0];
  return exe?.browser_download_url ?? url;
}

async function getConfiguredUrl(): Promise<string> {
  try {
    const { data } = await publicClient()
      .from("site_settings")
      .select("zozii_download_url")
      .maybeSingle();
    const raw = (data as { zozii_download_url?: string | null } | null)?.zozii_download_url;
    const trimmed = raw?.trim();
    if (trimmed && /^https:\/\//i.test(trimmed)) return trimmed;
  } catch {
    // fall through to default
  }
  return FALLBACK_URL;
}

export const Route = createFileRoute("/api/public/zozii-download")({
  server: {
    handlers: {
      GET: async () => {
        const configured = await getConfiguredUrl();
        const assetUrl = await resolveTagUrl(configured);
        const filename = decodeURIComponent(
          assetUrl.split("?")[0]!.split("/").pop() || "zozii-setup.exe",
        );

        const upstream = await fetch(assetUrl, {
          headers: { "User-Agent": "zozii-site" },
          redirect: "follow",
        });
        if (!upstream.ok || !upstream.body) {
          return new Response(`Download unavailable (${upstream.status}).`, {
            status: 502,
          });
        }

        const headers = new Headers();
        headers.set("Content-Type", "application/octet-stream");
        headers.set("Content-Disposition", `attachment; filename="${filename}"`);
        const len = upstream.headers.get("content-length");
        if (len) headers.set("Content-Length", len);
        headers.set("Cache-Control", "public, max-age=300");

        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
