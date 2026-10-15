import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import { shopProducts, type Product } from "./shop-data";

/** Local fallback while /store/search is unavailable. */
export function searchProductsLocal(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/).filter(Boolean);
  return shopProducts
    .map((p) => {
      const hay = `${p.brand} ${p.name} ${p.category} ${p.subcategory ?? ""}`.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += 1;
        if (p.brand.toLowerCase().includes(t)) score += 2;
        if (p.name.toLowerCase().startsWith(t)) score += 3;
      }
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}

/** @deprecated Prefer useSearchProducts — kept for sync call sites during transition. */
export function searchProducts(query: string): Product[] {
  return searchProductsLocal(query);
}

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
    return searchProductsLocal(q);
  }
}

export function useSearchProducts(query: string, limit = 48) {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromApi, setFromApi] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setFromApi(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchProductsApi(q, limit).then((items) => {
      if (cancelled) return;
      setResults(items);
      setFromApi(true);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [query, limit]);

  return { results, loading, fromApi };
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
