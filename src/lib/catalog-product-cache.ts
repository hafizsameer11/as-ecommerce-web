import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import { getProductById, shopProducts, type Product } from "@/lib/shop-data";
import { useCatalogVersion } from "@/lib/catalog-version";

export function cacheProduct(product: Product) {
  const idx = shopProducts.findIndex((p) => p.id === product.id);
  if (idx >= 0) shopProducts[idx] = product;
  else shopProducts.push(product);
  useCatalogVersion.getState().bump();
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const existing = getProductById(id);
  if (existing) return existing;
  try {
    const dto = await catalogApi.getProduct(id);
    rememberApiMeta(dto);
    const p = mapApiProduct(dto);
    cacheProduct(p);
    return p;
  } catch {
    return undefined;
  }
}

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];

  const needFetch = unique.filter((id) => !getProductById(id));
  if (needFetch.length > 0) {
    try {
      const { items } = await catalogApi.listProducts({
        ids: needFetch.join(","),
        pageSize: Math.max(needFetch.length, 24),
      });
      for (const dto of items) {
        rememberApiMeta(dto);
        cacheProduct(mapApiProduct(dto));
      }
    } catch {
      await Promise.all(needFetch.map((id) => fetchProductById(id)));
    }
  }

  return unique.map((id) => getProductById(id)).filter((p): p is Product => !!p);
}

/** Resolve a single product from hydrated catalog or GET /store/products/:id. */
export function useProduct(id: string | null | undefined) {
  const catalogV = useCatalogVersion((s) => s.v);
  const [product, setProduct] = useState<Product | undefined>(() => (id ? getProductById(id) : undefined));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setProduct(undefined);
      return;
    }
    const cached = getProductById(id);
    if (cached) {
      setProduct(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProductById(id).then((p) => {
      if (!cancelled) {
        setProduct(p);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [id, catalogV]);

  return { product, loading };
}

export function useProductsByIds(ids: string[]) {
  const catalogV = useCatalogVersion((s) => s.v);
  const key = ids.join(",");
  const [products, setProducts] = useState<Product[]>(() =>
    ids.map((id) => getProductById(id)).filter((p): p is Product => !!p)
  );
  const [loading, setLoading] = useState(() => products.length < ids.length);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProductsByIds(ids).then((list) => {
      if (!cancelled) {
        setProducts(list);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [key, catalogV]);

  return { products, loading };
}

export function useRelatedProducts(productId: string | undefined, limit = 4) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    if (!productId) {
      setRelated([]);
      return;
    }
    let cancelled = false;
    catalogApi
      .related(productId, limit)
      .then((rows) => {
        if (cancelled) return;
        setRelated(
          (rows ?? []).map((p) => {
            rememberApiMeta(p);
            return mapApiProduct(p);
          })
        );
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });
    return () => {
      cancelled = true;
    };
  }, [productId, limit]);

  return related;
}
