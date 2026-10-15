import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import type { Product } from "./shop-data";

export async function searchProductsApi(query: string, limit = 48): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const res = await catalogApi.search(q, limit);
    return (res.products ?? []).map((p) => {
      rememberApiMeta(p);
      return mapApiProduct(p);
    });
  } catch (err) {
    console.warn("[search]", err);
    return [];
  }
}

/** @deprecated Use searchProductsApi or useSearchProducts. */
export function searchProducts(_query: string): Product[] {
  return [];
}

export function useSearchProducts(query: string, limit = 48) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    catalogApi
      .search(q, limit)
      .then((res) => {
        if (cancelled) return;
        setResults(
          (res.products ?? []).map((p) => {
            rememberApiMeta(p);
            return mapApiProduct(p);
          })
        );
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[search]", err);
        setResults([]);
        setError(err instanceof Error ? err.message : "Search failed");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, limit]);

  return { results, loading, error };
}

export function usePopularSearches() {
  const [items, setItems] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    catalogApi
      .popularSearches()
      .then((list) => {
        if (!cancelled && Array.isArray(list)) setItems(list);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  return items;
}
