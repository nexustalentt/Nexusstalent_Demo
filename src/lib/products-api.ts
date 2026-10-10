import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import {
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
  getDefaultProducts,
  normalizeProduct,
  type ProductItem,
} from "./products-store";
import {
  getProductsServerFn,
  saveProductServerFn,
  deleteProductServerFn,
} from "./products.functions";
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks whether the 'products' table is created and accessible in Supabase
 */
export async function checkSupabaseProductsTable(): Promise<{ ok: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("products" as any).select("id").limit(1);
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Failed to query Supabase" };
  }
}

/**
 * Pushes all current local products to Supabase in one batch.
 * Useful when the table was just created or when syncing existing locally added products.
 */
export async function pushLocalProductsToSupabase(): Promise<{ count: number; error?: string }> {
  if (typeof window === "undefined") return { count: 0 };
  try {
    const local = getLocalProducts();
    if (local.length === 0) return { count: 0 };

    const records = local.map((saved) => ({
      id: saved.id,
      name: saved.name,
      tagline: saved.tagline,
      description: saved.description || "",
      category: saved.category,
      status: saved.status,
      status_label: saved.status_label || null,
      link_type: saved.link_type || "website",
      website_url: saved.website_url || null,
      preview_url: saved.preview_url || null,
      tags: saved.tags,
      highlights: saved.highlights || [],
      version: saved.version || "v1.0",
      featured: saved.featured || false,
      sort_order: saved.sort_order || 0,
      created_at: saved.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("products" as any).upsert(records);
    if (error) {
      return { count: 0, error: error.message };
    }
    return { count: records.length };
  } catch (err: any) {
    return { count: 0, error: err?.message || "Failed to push to Supabase" };
  }
}

export const productsQuery = queryOptions({
  queryKey: ["products", "list"],
  queryFn: async (): Promise<ProductItem[]> => {
    let serverProducts: ProductItem[] = [];
    let serverHasSupabase = false;

    // 1. Try server function first
    try {
      const res = await getProductsServerFn();
      if (res.ok && Array.isArray(res.products) && res.products.length > 0) {
        serverProducts = res.products;
        serverHasSupabase = true;
      }
    } catch {
      // Server function error
    }

    // 2. In client environment (mobile browser, desktop, tablet):
    if (typeof window !== "undefined") {
      let liveFromSupabase = false;

      try {
        const { data: dbData, error } = await supabase
          .from("products" as any)
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && Array.isArray(dbData)) {
          // Table exists and query succeeded in Supabase!
          serverProducts = dbData.map(normalizeProduct);
          liveFromSupabase = true;
        }
      } catch (e) {
        console.warn("[products-api] Client Supabase query note:", e);
      }

      // If Supabase is live, it is the SINGLE SOURCE OF TRUTH across all devices:
      if (liveFromSupabase) {
        try {
          window.localStorage.setItem("nexus_talent_products_v1", JSON.stringify(serverProducts));
        } catch {}
        return serverProducts;
      }

      // Fallback only when Supabase is offline or the table has not been created yet:
      const local = getLocalProducts();
      return local.length > 0 ? local : getDefaultProducts();
    }

    return serverProducts.length > 0 ? serverProducts : getDefaultProducts();
  },
  staleTime: 1000 * 2, // 2 seconds
  refetchOnMount: true,
});

/**
 * Hook that listens to product changes and keeps local state synced with UI updates
 */
export function useProducts() {
  const queryClient = useQueryClient();
  const query = useQuery(productsQuery);
  const [localItems, setLocalItems] = useState<ProductItem[]>(() => {
    if (typeof window !== "undefined") {
      return getLocalProducts();
    }
    return getDefaultProducts();
  });

  // Keep state updated when query data arrives
  useEffect(() => {
    if (query.data && Array.isArray(query.data)) {
      setLocalItems(query.data);
    }
  }, [query.data]);

  // Reactive listener for local updates and cross-tab storage changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    function onCustomUpdate(event: Event) {
      const custom = event as CustomEvent<ProductItem[]>;
      if (custom.detail && Array.isArray(custom.detail)) {
        setLocalItems(custom.detail);
        queryClient.setQueryData(["products", "list"], custom.detail);
      }
    }

    function onStorageUpdate(e: StorageEvent) {
      if (e.key === "nexus_talent_products_v1" || e.key === "nexus_talent_products_deleted_v1") {
        const latest = getLocalProducts();
        setLocalItems(latest);
        queryClient.setQueryData(["products", "list"], latest);
      }
    }

    window.addEventListener("nexus-products-updated", onCustomUpdate);
    window.addEventListener("storage", onStorageUpdate);
    return () => {
      window.removeEventListener("nexus-products-updated", onCustomUpdate);
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, [queryClient]);

  // Smartly prioritize the most up-to-date data list
  const activeProducts = useMemo(() => {
    if (typeof window === "undefined") {
      return query.data ?? localItems;
    }

    if (query.data && Array.isArray(query.data)) {
      return query.data;
    }
    return localItems.length > 0 ? localItems : getDefaultProducts();
  }, [query.data, localItems]);

  return {
    ...query,
    data: activeProducts,
  };
}

/**
 * Mutation for saving or updating a product
 */
export function useSaveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<ProductItem> & { id?: string | undefined; name: string }) => {
      // 1. Immediately save to local client store (instant feedback on this device)
      const saved = saveLocalProduct(input);

      const dbPayload = {
        id: saved.id,
        name: saved.name,
        tagline: saved.tagline,
        description: saved.description || "",
        category: saved.category,
        status: saved.status,
        status_label: saved.status_label || null,
        link_type: saved.link_type || "website",
        website_url: saved.website_url || null,
        preview_url: saved.preview_url || null,
        tags: saved.tags,
        highlights: saved.highlights || [],
        version: saved.version || "v1.0",
        featured: saved.featured || false,
        sort_order: saved.sort_order || 0,
        updated_at: new Date().toISOString(),
      };

      // 2. Direct client upsert to Supabase
      let supabaseErrorMsg: string | null = null;
      try {
        const { error: sbError } = await supabase
          .from("products" as any)
          .upsert(dbPayload);

        if (sbError) {
          supabaseErrorMsg = sbError.message;
          console.error("[products-api] Supabase upsert error:", sbError);
        }
      } catch (err: any) {
        supabaseErrorMsg = err?.message || "Network error connecting to Supabase";
      }

      // 3. Broadcast to server function (persists to server storage, memory, and database)
      try {
        await saveProductServerFn({
          data: {
            id: saved.id,
            name: saved.name,
            tagline: saved.tagline,
            description: saved.description,
            category: saved.category,
            status: saved.status,
            status_label: saved.status_label,
            link_type: saved.link_type || "website",
            website_url: saved.website_url || "",
            preview_url: saved.preview_url || "",
            tags: saved.tags,
            highlights: saved.highlights || [],
            version: saved.version || "v1.0",
            featured: saved.featured || false,
            sort_order: saved.sort_order || 0,
          },
        });
      } catch (err) {
        console.warn("[products-api] Server save warning:", err);
      }

      if (supabaseErrorMsg) {
        throw new Error(
          `Product saved locally, but failed to sync to Supabase database (${supabaseErrorMsg}). Please ensure the 'products' table exists in Supabase so mobile and other devices can see it.`
        );
      }

      return saved;
    },
    onSuccess: (saved) => {
      queryClient.setQueryData<ProductItem[]>(["products", "list"], (prev) => {
        if (!prev) return [saved];
        const index = prev.findIndex((p) => p.id === saved.id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = saved;
          return next;
        }
        return [saved, ...prev];
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

/**
 * Mutation for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // 1. Immediately delete from local client store
      deleteLocalProduct(id);

      // 2. Direct client delete from Supabase
      let supabaseErrorMsg: string | null = null;
      try {
        const { error: sbError } = await supabase
          .from("products" as any)
          .delete()
          .eq("id", id);

        if (sbError) {
          supabaseErrorMsg = sbError.message;
          console.error("[products-api] Supabase delete error:", sbError);
        }
      } catch (err: any) {
        supabaseErrorMsg = err?.message || "Network error connecting to Supabase";
      }

      // 3. Broadcast to server to permanently remove
      try {
        await deleteProductServerFn({ data: { id } });
      } catch (err) {
        console.warn("[products-api] Server delete warning (local cache deleted):", err);
      }

      if (supabaseErrorMsg) {
        throw new Error(
          `Product deleted locally, but failed to delete from Supabase database (${supabaseErrorMsg}). Please ensure the 'products' table exists in Supabase so mobile and other devices reflect the deletion.`
        );
      }

      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<ProductItem[]>(["products", "list"], (prev) =>
        prev ? prev.filter((p) => p.id !== id) : [],
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
