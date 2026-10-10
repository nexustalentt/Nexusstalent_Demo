import initialProductsData from "@/data/products.json";

export type ProductStatus = "in_development" | "live" | "beta" | "planned";

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: ProductStatus;
  status_label?: string;
  website_url?: string;
  preview_url?: string;
  tags: string[];
  highlights?: string[];
  version?: string;
  featured?: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "nexus_talent_products_v1";

/**
 * Normalizes and formats the raw products from seed json or storage
 */
export function getDefaultProducts(): ProductItem[] {
  return (initialProductsData as unknown as ProductItem[]).map((p, idx) => ({
    ...p,
    sort_order: p.sort_order ?? idx + 1,
    status: (p.status as ProductStatus) ?? "in_development",
  }));
}

/**
 * Returns all products, merging seed products with any added/updated products in local storage.
 */
export function getLocalProducts(): ProductItem[] {
  if (typeof window === "undefined") {
    return getDefaultProducts();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = getDefaultProducts();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (error) {
    console.warn("[products-store] Failed to load from localStorage:", error);
  }

  return getDefaultProducts();
}

/**
 * Saves or updates a product in storage.
 */
export function saveLocalProduct(product: Partial<ProductItem> & { name: string }): ProductItem {
  const existing = getLocalProducts();
  const now = new Date().toISOString();

  let targetId = product.id;
  if (!targetId) {
    targetId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const existingIndex = existing.findIndex((p) => p.id === targetId);

  const fullProduct: ProductItem = {
    id: targetId,
    name: product.name.trim(),
    tagline: product.tagline?.trim() || "Proprietary software platform",
    description: product.description?.trim() || "",
    category: product.category?.trim() || "Web & Mobile Apps",
    status: product.status || "in_development",
    status_label:
      product.status_label?.trim() ||
      (product.status === "live"
        ? "Live in Production"
        : product.status === "beta"
          ? "Beta Testing"
          : product.status === "planned"
            ? "Planned Stage"
            : "Currently Working On"),
    website_url: product.website_url?.trim() || undefined,
    preview_url: product.preview_url?.trim() || undefined,
    tags: Array.isArray(product.tags)
      ? product.tags.map((t) => t.trim()).filter(Boolean)
      : [],
    highlights: Array.isArray(product.highlights)
      ? product.highlights.map((h) => h.trim()).filter(Boolean)
      : [],
    version: product.version?.trim() || "v1.0",
    featured: Boolean(product.featured),
    sort_order: product.sort_order ?? (existingIndex >= 0 ? existing[existingIndex].sort_order : 0),
    created_at: existingIndex >= 0 ? existing[existingIndex].created_at : now,
    updated_at: now,
  };

  let updatedList: ProductItem[];
  if (existingIndex >= 0) {
    updatedList = [...existing];
    updatedList[existingIndex] = fullProduct;
  } else {
    updatedList = [fullProduct, ...existing];
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      // Dispatch an event so tabs or other components update reactively
      window.dispatchEvent(new CustomEvent("nexus-products-updated", { detail: updatedList }));
    } catch (e) {
      console.warn("[products-store] Failed to save to localStorage:", e);
    }
  }

  return fullProduct;
}

/**
 * Removes a product by ID from storage.
 */
export function deleteLocalProduct(productId: string): boolean {
  const existing = getLocalProducts();
  const updated = existing.filter((p) => p.id !== productId);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("nexus-products-updated", { detail: updated }));
    } catch (e) {
      console.warn("[products-store] Failed to update localStorage on delete:", e);
    }
  }

  return true;
}

/**
 * Resets products to default seed items.
 */
export function resetLocalProducts(): ProductItem[] {
  const defaults = getDefaultProducts();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      window.dispatchEvent(new CustomEvent("nexus-products-updated", { detail: defaults }));
    } catch (e) {
      console.warn("[products-store] Failed to reset localStorage:", e);
    }
  }
  return defaults;
}
