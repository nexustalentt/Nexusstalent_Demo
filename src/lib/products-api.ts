import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  getLocalProducts,
  saveLocalProduct,
  deleteLocalProduct,
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
    // In client environment, prioritize or merge with local store
    if (typeof window !== "undefined") {
      const local = getLocalProducts();
      return local;
    }

    try {
      const res = await getProductsServerFn();
      if (res.ok && res.products.length > 0) {
        return res.products;
      }
    } catch {
      // Fallback to defaults
    }

    return getLocalProducts();
  },
  staleTime: 1000 * 30, // 30 seconds
});

/**
 * Hook that listens to product changes and keeps local state synced with UI updates
 */
export function useProducts() {
  const queryClient = useQueryClient();
  const query = useQuery(productsQuery);
  const [items, setItems] = useState<ProductItem[]>(() => getLocalProducts());

  useEffect(() => {
    if (query.data) {
      setItems(query.data);
    }
  }, [query.data]);

  useEffect(() => {
    function onUpdate(event: Event) {
      const custom = event as CustomEvent<ProductItem[]>;
      if (custom.detail) {
        setItems(custom.detail);
        queryClient.setQueryData(["products", "list"], custom.detail);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("nexus-products-updated", onUpdate);
      return () => window.removeEventListener("nexus-products-updated", onUpdate);
    }
  }, [queryClient]);

  return {
    ...query,
    data: query.data ?? items,
  };
}

/**
 * Mutation for saving or updating a product
 */
export function useSaveProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Partial<ProductItem> & { name: string }) => {
      // 1. Immediately save to local client store
      const saved = saveLocalProduct(input);

      // 2. Also broadcast to server function in background
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
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
      // 1. Delete from local client store
      deleteLocalProduct(id);

      // 2. Also broadcast to server
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
