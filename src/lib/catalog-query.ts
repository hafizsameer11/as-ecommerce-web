import { useEffect, useState } from "react";
import { catalogApi, type ProductListMeta, type ProductListQuery } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import { nairaToKobo } from "@/lib/api/client";
import type { FilterState } from "@/components/shop/ProductFilters";
import {
  getProductsByCategory,
  getNewArrivals,
  isOnSale,
  shopProducts,
  type Product,
} from "@/lib/shop-data";
import { isCatalogHydrated } from "@/lib/catalog-hydrate";

const AVAIL_MAP: Record<string, string> = {
  "In Stock": "in_stock",
  "Pre Order": "pre_order",
  "Limited Pieces": "limited",
  Restocked: "restocked",
};

const SORT_MAP: Record<string, ProductListQuery["sort"]> = {
  featured: "featured",
  popular: "trending",
  newest: "newest",
  "price-low": "price_asc",
  "price-high": "price_desc",
  "name-az": "name",
  trending: "trending",
  "best-selling": "best_selling",
  "best_selling": "best_selling",
};

const PRICE_RANGE_KOBO: Record<string, { min?: number; max?: number }> = {
  "under-100k": { max: 10_000_000 },
  "100k-250k": { min: 10_000_000, max: 25_000_000 },
  "250k-500k": { min: 25_000_000, max: 50_000_000 },
  "above-500k": { min: 50_000_000 },
};

export type StoreListOptions = {
  category?: string;
  subcategory?: string;
  brand?: string;
  collection?: string;
  onSale?: boolean;
  sort?: string;
  q?: string;
  filters?: FilterState;
  page?: number;
  pageSize?: number;
  /** Special listing presets mapped to API sort */
  preset?: "trending" | "best-sellers" | "new-arrivals" | "sales";
};

export function buildProductListQuery(opts: StoreListOptions): ProductListQuery {
  const f = opts.filters;
  const query: ProductListQuery = {
    page: opts.page ?? 1,
    pageSize: opts.pageSize ?? 24,
  };

  if (opts.q) query.q = opts.q;
  if (opts.collection) query.collection = opts.collection;
  if (opts.brand) query.brand = opts.brand;

  if (opts.preset === "sales" || opts.onSale || opts.category === "sale" || opts.category === "sales") {
    query.onSale = true;
  } else if (opts.category && !["all", "new", "trending", "best-sellers"].includes(opts.category)) {
    query.category = opts.category;
  }

  const sub = opts.subcategory || f?.subCategories?.[0];
  if (sub) query.subcategory = sub;

  if (f?.brands?.length) query.brand = f.brands.join(",");
  if (f?.sizes?.length) query.size = f.sizes.join(",");
  if (f?.colors?.length) query.color = f.colors.join(",");
  if (f?.availability?.length) {
    query.availability = f.availability.map((a) => AVAIL_MAP[a] ?? a).join(",");
  }
  if (f?.categories?.length && !query.category) {
    query.category = f.categories[0];
  }

  let minPrice = f?.minPrice ? nairaToKobo(Number(f.minPrice)) : undefined;
  let maxPrice = f?.maxPrice ? nairaToKobo(Number(f.maxPrice)) : undefined;
  if (f?.priceRanges?.length === 1) {
    const bucket = PRICE_RANGE_KOBO[f.priceRanges[0]!];
    if (bucket) {
      minPrice = bucket.min ?? minPrice;
      maxPrice = bucket.max ?? maxPrice;
    }
  } else if (f?.priceRanges?.length && f.priceRanges.length > 1) {
    const mins = f.priceRanges.map((id) => PRICE_RANGE_KOBO[id]?.min ?? 0);
    const maxes = f.priceRanges.map((id) => PRICE_RANGE_KOBO[id]?.max ?? Number.MAX_SAFE_INTEGER);
    minPrice = Math.min(...mins);
    const mx = Math.max(...maxes);
    maxPrice = mx === Number.MAX_SAFE_INTEGER ? undefined : mx;
  }
  if (minPrice != null && !Number.isNaN(minPrice)) query.minPrice = minPrice;
  if (maxPrice != null && !Number.isNaN(maxPrice)) query.maxPrice = maxPrice;

  if (opts.preset === "trending") query.sort = "trending";
  else if (opts.preset === "best-sellers") query.sort = "best_selling";
  else if (opts.preset === "new-arrivals") query.sort = "newest";
  else if (opts.sort) query.sort = SORT_MAP[opts.sort] ?? opts.sort;
  else query.sort = "featured";

  return query;
}

function fallbackProducts(opts: StoreListOptions): Product[] {
  if (opts.preset === "new-arrivals" || opts.category === "new") return getNewArrivals(opts.pageSize ?? 48);
  if (opts.preset === "trending" || opts.category === "trending") return getProductsByCategory("trending");
  if (opts.preset === "best-sellers" || opts.category === "best-sellers") return getProductsByCategory("best-sellers");
  if (opts.preset === "sales" || opts.onSale || opts.category === "sale" || opts.category === "sales") {
    return shopProducts.filter(isOnSale);
  }
  if (opts.brand) {
    const key = opts.brand.toLowerCase();
    return shopProducts.filter(
      (p) =>
        p.brand.toLowerCase() === key ||
        p.brand.toLowerCase().replace(/\s+/g, "-") === key ||
        (p.brandHandle ?? "").toLowerCase() === key
    );
  }
  if (opts.category) return getProductsByCategory(opts.category, opts.subcategory);
  if (opts.q) {
    const q = opts.q.toLowerCase();
    return shopProducts.filter((p) => `${p.brand} ${p.name}`.toLowerCase().includes(q));
  }
  return [...shopProducts];
}

function applyClientFilters(list: Product[], opts: StoreListOptions): Product[] {
  let result = [...list];
  const f = opts.filters;
  if (!f) return result;
  if (f.subCategories.length) result = result.filter((p) => p.subcategory && f.subCategories.includes(p.subcategory));
  if (f.sizes.length) result = result.filter((p) => p.sizes.some((s) => f.sizes.includes(s)));
  if (f.colors.length) result = result.filter((p) => p.colors.some((c) => f.colors.includes(c.name)));
  if (f.brands.length) result = result.filter((p) => f.brands.includes(p.brand));
  if (f.availability.length) result = result.filter((p) => f.availability.includes(p.availability));
  if (f.categories.length) result = result.filter((p) => f.categories.includes(p.category));
  if (f.priceRanges.length) {
    result = result.filter((p) =>
      f.priceRanges.some((r) => {
        if (r === "under-100k") return p.price < 100000;
        if (r === "100k-250k") return p.price >= 100000 && p.price <= 250000;
        if (r === "250k-500k") return p.price >= 250000 && p.price <= 500000;
        if (r === "above-500k") return p.price >= 500000;
        return true;
      })
    );
  }
  if (f.minPrice || f.maxPrice) {
    const min = f.minPrice ? Number(f.minPrice) : 0;
    const max = f.maxPrice ? Number(f.maxPrice) : Infinity;
    result = result.filter((p) => p.price >= min && p.price <= max);
  }
  const sort = opts.sort ?? "featured";
  if (sort === "price-low") result.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") result.sort((a, b) => b.price - a.price);
  else if (sort === "name-az") result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export type StoreProductsResult = {
  products: Product[];
  meta: ProductListMeta;
  loading: boolean;
  fromApi: boolean;
  error: string | null;
};

/** Live listing via GET /store/products (+ facets-ready query). Falls back to shop-data only if the request fails. */
export function useStoreProducts(opts: StoreListOptions): StoreProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ProductListMeta>({});
  const [loading, setLoading] = useState(true);
  const [fromApi, setFromApi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = JSON.stringify(opts);

  useEffect(() => {
    let cancelled = false;
    const query = buildProductListQuery(opts);
    setLoading(true);
    setError(null);

    catalogApi
      .listProducts(query)
      .then(({ items, meta: m }) => {
        if (cancelled) return;
        const mapped = items.map((p) => {
          rememberApiMeta(p);
          return mapApiProduct(p);
        });
        setProducts(mapped);
        setMeta(m);
        setFromApi(true);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[catalog] listProducts", err);
        const fb = applyClientFilters(fallbackProducts(opts), opts);
        const page = opts.page ?? 1;
        const pageSize = opts.pageSize ?? 24;
        const start = (page - 1) * pageSize;
        setProducts(isCatalogHydrated() || fb.length ? fb.slice(start, start + pageSize) : fb.slice(start, start + pageSize));
        setMeta({ page, pageSize, total: fb.length, pageCount: Math.max(1, Math.ceil(fb.length / pageSize)) });
        setFromApi(false);
        setError(err instanceof Error ? err.message : "Failed to load products");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- key captures opts
  }, [key]);

  return { products, meta, loading, fromApi, error };
}

export async function fetchStoreProducts(opts: StoreListOptions): Promise<{ products: Product[]; meta: ProductListMeta; fromApi: boolean }> {
  try {
    const { items, meta } = await catalogApi.listProducts(buildProductListQuery(opts));
    const products = items.map((p) => {
      rememberApiMeta(p);
      return mapApiProduct(p);
    });
    return { products, meta, fromApi: true };
  } catch (err) {
    console.warn("[catalog] fetchStoreProducts", err);
    const fb = applyClientFilters(fallbackProducts(opts), opts);
    const page = opts.page ?? 1;
    const pageSize = opts.pageSize ?? 24;
    return {
      products: fb.slice((page - 1) * pageSize, page * pageSize),
      meta: { page, pageSize, total: fb.length, pageCount: Math.max(1, Math.ceil(fb.length / pageSize)) },
      fromApi: false,
    };
  }
}
