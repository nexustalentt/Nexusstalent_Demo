import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDefaultProducts, type ProductItem } from "./products-store";

const productInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Product name must be at least 2 characters").max(200),
  tagline: z.string().trim().min(2),
  description: z.string().trim().default(""),
  category: z.string().trim().max(100).default("Web & Mobile Apps"),
  status: z.enum(["in_development", "live", "beta", "planned"]).default("in_development"),
  status_label: z.string().trim().max(100).optional(),
  link_type: z.enum(["website", "exe"]).default("website"),
  website_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
      "Must be a valid URL or path"
    )
    .optional()
    .or(z.literal("")),
  preview_url: z
    .string()
    .trim()
    .refine(
      (val) => !val || val.startsWith("/") || /^https?:\/\//i.test(val),
      "Must be a valid URL or path"
    )
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  version: z.string().trim().max(60).default("v1.0"),
  featured: z.boolean().default(false),
  sort_order: z.number().int().default(0),
});

export const getProductsServerFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; products: ProductItem[] }> => {
    try {
      const { getProductsServer } = await import("./products.server");
      const products = await getProductsServer();
      return { ok: true, products };
    } catch (e) {
      console.warn("[products.functions] Server get error, using default products:", e);
      return { ok: true, products: getDefaultProducts() };
    }
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
      link_type: data.link_type,
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
      const { saveProductServer } = await import("./products.server");
      const saved = await saveProductServer(productRecord);
      return { ok: true, product: saved };
    } catch (e) {
      console.warn("[products.functions] Save server error:", e);
      return { ok: true, product: productRecord };
    }
  });

export const deleteProductServerFn = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => ({ id: String(data.id) }))
  .handler(async ({ data }): Promise<{ ok: boolean }> => {
    try {
      const { deleteProductServer } = await import("./products.server");
      await deleteProductServer(data.id);
    } catch (e) {
      console.warn("[products.functions] Server delete error:", e);
    }

    return { ok: true };
  });
