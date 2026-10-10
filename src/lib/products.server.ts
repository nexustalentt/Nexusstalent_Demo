import fs from "node:fs";
import path from "node:path";
import { getDefaultProducts, normalizeProduct, type ProductItem } from "./products-store";
import { supabase } from "@/integrations/supabase/client";

// In-memory cache for fast access across server handlers
let serverProductsCache: ProductItem[] | null = null;
const serverDeletedIds = new Set<string>();

function getProductsFilePath(): string | null {
  try {
    const cwd = process.cwd();
    const candidate = path.resolve(cwd, "src", "data", "products.json");
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  } catch {
    // Filesystem may be inaccessible in some environments
  }
  return null;
}

/**
 * Loads products from disk (src/data/products.json) or falls back to bundled default products.
 */
export function readServerProductsFromFile(): ProductItem[] {
  const filePath = getProductsFilePath();
  if (filePath) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return (parsed as ProductItem[]).map(normalizeProduct);
      }
    } catch (e) {
      console.warn("[products.server] Failed to read products.json from disk:", e);
    }
  }
  return getDefaultProducts();
}

/**
 * Persists products to disk (src/data/products.json) if the filesystem is writable.
 */
export function writeServerProductsToFile(products: ProductItem[]): boolean {
  const filePath = getProductsFilePath();
  if (filePath) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), "utf-8");
      return true;
    } catch (e) {
      console.warn("[products.server] Failed to write products.json to disk:", e);
    }
  }
  return false;
}

/**
 * Gets all products on the server: tries Supabase first, falls back to disk file / memory cache.
 */
export async function getProductsServer(): Promise<ProductItem[]> {
  // 1. Try Supabase if configured
  try {
    const { data, error } = await supabase
      .from("products" as any)
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const items = (data as unknown as ProductItem[])
        .filter((p) => !serverDeletedIds.has(p.id))
        .map(normalizeProduct);
      serverProductsCache = items;
      return items;
    }
  } catch {
    // Supabase table or credentials not configured
  }

  // 2. Fall back to memory cache or disk file
  if (!serverProductsCache) {
    serverProductsCache = readServerProductsFromFile();
  }

  return serverProductsCache.filter((p) => !serverDeletedIds.has(p.id));
}

/**
 * Saves or updates a product on the server (persisting to disk, in-memory cache, and Supabase).
 */
export async function saveProductServer(productRecord: ProductItem): Promise<ProductItem> {
  const normalized = normalizeProduct(productRecord);

  // Unmark if previously deleted
  serverDeletedIds.delete(normalized.id);

  // 1. Update in-memory & file storage
  const current = serverProductsCache ?? readServerProductsFromFile();
  const existingIndex = current.findIndex((p) => p.id === normalized.id);
  const existingItem = existingIndex >= 0 ? current[existingIndex] : undefined;

  let updatedList: ProductItem[];
  if (existingIndex >= 0 && existingItem) {
    updatedList = [...current];
    updatedList[existingIndex] = {
      ...existingItem,
      ...normalized,
      created_at: existingItem.created_at || normalized.created_at,
      updated_at: new Date().toISOString(),
    };
  } else {
    updatedList = [normalized, ...current];
  }

  serverProductsCache = updatedList;
  writeServerProductsToFile(updatedList);

  // 2. Upsert to Supabase if available
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
    await supabaseClient.from("products" as any).upsert(normalized);
  } catch (e) {
    console.warn("[products.server] Supabase upsert note:", e);
  }

  return normalized;
}

/**
 * Deletes a product on the server (updating disk, memory, and Supabase).
 */
export async function deleteProductServer(id: string): Promise<boolean> {
  serverDeletedIds.add(id);

  const current = serverProductsCache ?? readServerProductsFromFile();
  const updatedList = current.filter((p) => p.id !== id);
  serverProductsCache = updatedList;
  writeServerProductsToFile(updatedList);

  // Delete from Supabase if available
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
    await supabaseClient.from("products" as any).delete().eq("id", id);
  } catch (e) {
    console.warn("[products.server] Supabase delete note:", e);
  }

  return true;
}
