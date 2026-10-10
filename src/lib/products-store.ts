import initialProductsData from "../data/products.json";

export type ProductStatus = "in_development" | "live" | "beta" | "planned";

export type ProductLinkType = "website" | "exe";

export interface ProductItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: string;
  status: ProductStatus;
  status_label?: string | undefined;
  link_type?: ProductLinkType | undefined;
  website_url?: string | undefined;
  preview_url?: string | undefined;
  tags: string[];
  highlights?: string[] | undefined;
  version?: string | undefined;
  featured?: boolean | undefined;
  sort_order?: number | undefined;
  created_at: string;
  updated_at: string;
}

const STORAGE_KEY = "nexus_talent_products_v1";
const DELETED_KEY = "nexus_talent_products_deleted_v1";

/**
 * Normalizes product URLs so old inaccessible GitHub release links are redirected to local downloadable exes,
 * while respecting any user-customized URLs and link types.
 */
export function normalizeProduct(product: ProductItem): ProductItem {
  let website_url = product.website_url;
  let preview_url = product.preview_url;
  let link_type = product.link_type;

  // If pointing to the old private GitHub release tag, redirect to the local bundled exe
  if (
    website_url &&
    (website_url.includes("jobconnect-x-e65f4f66") || website_url.includes("V01_S"))
  ) {
    if (!preview_url) {
      preview_url = website_url;
    }
    website_url = "/downloads/Screenshot.Saver.1.exe";
    link_type = "exe";
  }

  if (!link_type) {
    link_type =
      website_url?.includes("download") ||
      website_url?.endsWith(".exe") ||
      website_url === "/downloads/Screenshot.Saver.1.exe"
        ? "exe"
        : "website";
  }

  return {
    ...product,
    link_type,
    website_url,
    preview_url,
  };
}

/**
 * Normalizes and formats the raw products from seed json or storage
 */
export function getDefaultProducts(): ProductItem[] {
  return (initialProductsData as unknown as ProductItem[]).map((p, idx) => {
    const normalized = normalizeProduct({
      ...p,
      sort_order: p.sort_order ?? idx + 1,
      status: (p.status as ProductStatus) ?? "in_development",
      link_type: p.link_type ?? (p.website_url?.includes("download") || p.website_url?.endsWith(".exe") || p.id?.includes("screenshot") ? "exe" : "website"),
    });
    return normalized;
  });
}

export interface ProductActionInfo {
  url: string;
  isDownload: boolean;
  label: string;
  downloadFilename?: string | undefined;
}

/**
 * Resolves whether a product action is a direct executable download or an external web link.
 * When link_type is 'exe' or pointing to an executable/release, button label is 'Download'.
 */
export function resolveProductAction(product: {
  link_type?: ProductLinkType | undefined;
  website_url?: string | undefined;
  name?: string | undefined;
  preview_url?: string | undefined;
}): ProductActionInfo | null {
  const rawUrl = product.website_url?.trim() || "";
  if (!rawUrl) return null;

  const isExplicitExe = product.link_type === "exe";
  const isExplicitWebsite = product.link_type === "website";

  // Determine if this is an EXE / download
  const isExe =
    isExplicitExe ||
    (!isExplicitWebsite && (
      rawUrl === "/downloads/Screenshot.Saver.1.exe" ||
      rawUrl.includes("jobconnect-x-e65f4f66") ||
      rawUrl.includes("Screenshot.Saver") ||
      rawUrl.includes("V01_S") ||
      /\.(exe|msi|dmg|pkg|zip|apk)($|\?)/i.test(rawUrl)
    ));

  if (isExe) {
    if (
      rawUrl.includes("jobconnect-x-e65f4f66") ||
      rawUrl.includes("V01_S") ||
      rawUrl === "/downloads/Screenshot.Saver.1.exe"
    ) {
      return {
        url: "/downloads/Screenshot.Saver.1.exe",
        isDownload: true,
        label: "Download",
        downloadFilename: "Screenshot.Saver.1.exe",
      };
    }

    const filename = decodeURIComponent(rawUrl.split("?")[0]!.split("/").pop() || "installer.exe");
    return {
      url: rawUrl,
      isDownload: true,
      label: "Download",
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

export function getDeletedProductIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DELETED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Robustly merges two lists of products (e.g. server/default items and local stored items).
 * - Excludes any items in deleted IDs list.
 * - For items matching on ID, picks the version with the newer updated_at timestamp.
 * - Preserves newly created items from both sources.
 * - Sorts by sort_order ascending, then created_at descending.
 */
export function mergeProducts(
  baseProducts: ProductItem[],
  incomingProducts: ProductItem[]
): ProductItem[] {
  const deletedIds = getDeletedProductIds();
  const map = new Map<string, ProductItem>();

  for (const item of baseProducts) {
    if (!item?.id || deletedIds.includes(item.id)) continue;
    map.set(item.id, normalizeProduct(item));
  }

  for (const item of incomingProducts) {
    if (!item?.id || deletedIds.includes(item.id)) continue;
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, normalizeProduct(item));
    } else {
      // Compare timestamps to choose the newer one
      const existingTime = new Date(existing.updated_at || existing.created_at || 0).getTime();
      const incomingTime = new Date(item.updated_at || item.created_at || 0).getTime();
      if (incomingTime >= existingTime) {
        map.set(item.id, normalizeProduct(item));
      }
    }
  }

  const result = Array.from(map.values());
  result.sort((a, b) => {
    const orderA = a.sort_order ?? 999;
    const orderB = b.sort_order ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return result;
}

/**
 * Returns all products, merging seed products with any added/updated products in local storage.
 * Products explicitly deleted by the user will NEVER be re-added or resurrected.
 */
export function getLocalProducts(): ProductItem[] {
  if (typeof window === "undefined") {
    return getDefaultProducts();
  }

  const defaults = getDefaultProducts();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const deletedIds = getDeletedProductIds();
      const initial = defaults.filter((d) => !deletedIds.includes(d.id));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Merge defaults with localStorage so any updates to defaults or local items are preserved
      const merged = mergeProducts(defaults, parsed as ProductItem[]);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
  } catch (error) {
    console.warn("[products-store] Failed to load from localStorage:", error);
  }

  const deletedIds = getDeletedProductIds();
  return defaults.filter((d) => !deletedIds.includes(d.id));
}

/**
 * Saves or updates a product in storage.
 */
export function saveLocalProduct(product: Partial<ProductItem> & { id?: string | undefined; name: string }): ProductItem {
  const existing = getLocalProducts();
  const now = new Date().toISOString();

  let targetId = product.id;
  if (!targetId) {
    targetId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  // If this targetId was previously marked as deleted, unmark it
  if (typeof window !== "undefined" && targetId) {
    try {
      const deletedIds = getDeletedProductIds().filter((id) => id !== targetId);
      window.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
    } catch {}
  }

  const existingIndex = existing.findIndex((p) => p.id === targetId);
  const existingItem = existingIndex >= 0 ? existing[existingIndex] : undefined;

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
    link_type: product.link_type || "website",
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
    sort_order: product.sort_order ?? (existingItem?.sort_order ?? 0),
    created_at: existingItem?.created_at ?? now,
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

  return normalizedProduct;
}

/**
 * Removes a product by ID from storage permanently.
 */
export function deleteLocalProduct(productId: string): boolean {
  if (typeof window === "undefined" || !productId) return true;

  try {
    // 1. Permanently record ID in deleted list so it's NEVER resurrected by default seed
    const deletedIds = getDeletedProductIds();
    if (!deletedIds.includes(productId)) {
      deletedIds.push(productId);
      window.localStorage.setItem(DELETED_KEY, JSON.stringify(deletedIds));
    }

    // 2. Load stored products directly
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const currentList: ProductItem[] = raw ? JSON.parse(raw) : getDefaultProducts();

    // 3. Remove by ID
    const updated = currentList.filter((p) => p.id !== productId && !deletedIds.includes(p.id));

    // 4. Save and broadcast
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("nexus-products-updated", { detail: updated }));
    return true;
  } catch (e) {
    console.warn("[products-store] Failed to update localStorage on delete:", e);
    return false;
  }
}

/**
 * Resets products to default seed items and clears deleted IDs list.
 */
export function resetLocalProducts(): ProductItem[] {
  const defaults = getDefaultProducts();
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(DELETED_KEY);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
      window.dispatchEvent(new CustomEvent("nexus-products-updated", { detail: defaults }));
    } catch (e) {
      console.warn("[products-store] Failed to reset localStorage:", e);
    }
  }
  return defaults;
}
