import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import {
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
  mergeProducts,
  getDefaultProducts,
  type ProductItem,
} from "./products-store";
import {
  getProductsServerFn,
  saveProductServerFn,
  deleteProductServerFn,
} from "./products.functions";

export const productsQuery = queryOptions({
  queryKey: ["products", "list"],
  queryFn: async (): Promise<ProductItem[]> => {
    let serverProducts: ProductItem[] = [];

    try {
      const res = await getProductsServerFn();
      if (res.ok && Array.isArray(res.products) && res.products.length > 0) {
        serverProducts = res.products;
      } else {
        serverProducts = getDefaultProducts();
      }
    } catch {
      serverProducts = getDefaultProducts();
    }

    // In client environment, merge server products with client local store
    if (typeof window !== "undefined") {
      const local = getLocalProducts();
      const merged = mergeProducts(serverProducts, local);
      try {
        window.localStorage.setItem("nexus_talent_products_v1", JSON.stringify(merged));
      } catch {}
      return merged;
    }

    return serverProducts;
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

    // On client: if query.data is available, use merged list; otherwise fall back to localItems
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
      // 1. Immediately save to local client store (instant UI feedback)
      const saved = saveLocalProduct(input);

      // 2. Broadcast to server function (persists to server storage, memory, and database)
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
        console.warn("[products-api] Server save warning (local cache kept):", err);
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

      // 2. Broadcast to server to permanently remove
      try {
        await deleteProductServerFn({ data: { id } });
      } catch (err) {
        console.warn("[products-api] Server delete warning (local cache deleted):", err);
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
