import { createFileRoute } from "@tanstack/react-router";

const STATIC_PATHS = ["/", "/about", "/services", "/industries", "/careers", "/contact"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const entries: Array<{ loc: string; lastmod?: string }> = STATIC_PATHS.map((path) => ({
          loc: `${origin}${path}`,
        }));

        try {
          const { publicClient } = await import("@/lib/supabase-public.server");
          const { data } = await publicClient()
            .from("jobs")
            .select("slug, updated_at")
            .eq("status", "active")
            .limit(500);
          for (const job of data ?? []) {
            const entry: { loc: string; lastmod?: string } = {
              loc: `${origin}/careers/${job.slug}`,
            };
            if (job.updated_at) entry.lastmod = new Date(job.updated_at).toISOString();
            entries.push(entry);
          }
        } catch (error) {
          console.error("[sitemap] job fetch failed", error);
        }

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) =>
      `  <url><loc>${entry.loc}</loc>${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(body, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
