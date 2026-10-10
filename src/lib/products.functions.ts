import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDefaultProducts, type ProductItem } from "./products-store";
import { supabase } from "@/integrations/supabase/client";

const productInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(120),
  tagline: z.string().trim().min(3).max(250),
  description: z.string().trim().max(3000).default(""),
  category: z.string().trim().max(60).default("Web & Mobile Apps"),
  status: z.enum(["in_development", "live", "beta", "planned"]).default("in_development"),
  status_label: z.string().trim().max(60).optional(),
  website_url: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  preview_url: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  version: z.string().trim().max(30).default("v1.0"),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const getProductsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; products: ProductItem[] }> => {
    try {
      const { data, error } = await supabase
        .from("products" as any)
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return { ok: true, products: data as unknown as ProductItem[] };
      }
    } catch {
      // Supabase table may not exist yet; fall back safely
    }

    return { ok: true, products: getDefaultProducts() };
  },
);

export const saveProductServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => productInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ ok: boolean; product: ProductItem }> => {
    const id = data.id || `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    const productRecord: ProductItem = {
      id,
      name: data.name,
      tagline: data.tagline,
      description: data.description || "",
      category: data.category,
      status: data.status,
      status_label:
        data.status_label ||
        (data.status === "live"
          ? "Live in Production"
          : data.status === "beta"
            ? "Beta Testing"
            : data.status === "planned"
              ? "Planned Stage"
              : "Currently Working On"),
      website_url: data.website_url || undefined,
      preview_url: data.preview_url || undefined,
      tags: data.tags,
      highlights: data.highlights,
      version: data.version,
      featured: data.featured,
      sort_order: data.sort_order,
      created_at: now,
      updated_at: now,
    };

    try {
      // Attempt to save to Supabase products table if available
      let supabaseClient = supabase;
      if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          supabaseClient = supabaseAdmin;
        } catch {
          supabaseClient = supabase;
        }
      }

      await supabaseClient.from("products" as any).upsert(productRecord);
    } catch (e) {
      console.warn("[products.functions] Supabase upsert note:", e);
    }

    return { ok: true, product: productRecord };
  });

export const deleteProductServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    try {
      let supabaseClient = supabase;
      if (process.env["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SECRET_KEY"]) {
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          supabaseClient = supabaseAdmin;
        } catch {
          supabaseClient = supabase;
        }
      }
      await supabaseClient.from("products" as any).delete().eq("id", data.id);
    } catch (e) {
      console.warn("[products.functions] Supabase delete note:", e);
    }

    return { ok: true };
  });
