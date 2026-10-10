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

export interface ProductActionInfo {
  url: string;
  isDownload: boolean;
  label: string;
  downloadFilename?: string;
}

/**
 * Resolves whether a product action is a direct executable download or an external web link.
 * Special handling for Screenshot Saver converts GitHub release URLs to direct .exe downloads.
 */
export function resolveProductAction(product: {
  website_url?: string;
  name?: string;
  preview_url?: string;
}): ProductActionInfo | null {
  const rawUrl = product.website_url?.trim() || "";
  if (!rawUrl) return null;

  // Screenshot Saver specific download handling
  if (
    rawUrl.includes("jobconnect-x-e65f4f66") ||
    rawUrl.includes("Screenshot.Saver") ||
    rawUrl.includes("V01_S") ||
    rawUrl === "/downloads/Screenshot.Saver.1.exe" ||
    (product.name && /screenshot.*saver/i.test(product.name) && !rawUrl.startsWith("http://localhost"))
  ) {
    return {
      url: "/downloads/Screenshot.Saver.1.exe",
      isDownload: true,
      label: "Download .EXE (Windows)",
      downloadFilename: "Screenshot.Saver.1.exe",
    };
  }

  // General binary/installer file detection (.exe, .msi, .dmg, .zip, etc.)
  const isBinary = /\.(exe|msi|dmg|pkg|zip|tar\.gz|apk)($|\?)/i.test(rawUrl);
  if (isBinary) {
    const filename = decodeURIComponent(rawUrl.split("?")[0]!.split("/").pop() || "download.exe");
    return {
      url: rawUrl,
      isDownload: true,
      label: "Download .EXE",
      downloadFilename: filename,
    };
  }

  return {
    url: rawUrl,
    isDownload: false,
    label: "Open Website / App",
    downloadFilename: undefined,
  };
}

/**
 * Normalizes product URLs so private GitHub release links are redirected to local downloadable exes
 */
export function normalizeProduct(product: ProductItem): ProductItem {
  let website_url = product.website_url;
  let preview_url = product.preview_url;

  if (
    website_url &&
    (website_url.includes("jobconnect-x-e65f4f66") ||
      website_url.includes("V01_S") ||
      (product.name.toLowerCase().includes("screenshot") && website_url.includes("github.com")))
  ) {
    if (!preview_url) {
      preview_url = website_url;
    }
    website_url = "/downloads/Screenshot.Saver.1.exe";
  }

  return {
    ...product,
    website_url,
    preview_url,
  };
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
    const defaults = getDefaultProducts();
    if (!raw) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const normalized = (parsed as ProductItem[]).map(normalizeProduct);
      // Ensure any newly added default products (like Screenshot Saver) are merged in
      for (const d of defaults) {
        if (!normalized.some((p) => p.id === d.id || p.name.toLowerCase() === d.name.toLowerCase())) {
          normalized.push(d);
        }
      }
      return normalized;
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

  const normalizedProduct = normalizeProduct(fullProduct);

  let updatedList: ProductItem[];
  if (existingIndex >= 0) {
    updatedList = [...existing];
    updatedList[existingIndex] = normalizedProduct;
  } else {
    updatedList = [normalizedProduct, ...existing];
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
