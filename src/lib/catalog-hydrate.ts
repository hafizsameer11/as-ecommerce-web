import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import { shopProducts, bestSellerProducts, trendingProducts } from "@/lib/shop-data";
import { bestSellers, newArrivals, heroSlides, categories as homeCategories } from "@/lib/mock-data";
import { useCatalogVersion } from "@/lib/catalog-version";

let hydrated = false;
let inflight: Promise<void> | null = null;
let lastError: string | null = null;

function replaceArray<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

/**
 * Load catalogue from the API into in-memory arrays the home UI reads.
 */
export async function hydrateShopCatalogFromApi() {
  if (hydrated) return;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const [home, listed] = await Promise.all([
        catalogApi.home(),
        catalogApi.listProducts({ pageSize: 100, sort: "featured" }),
      ]);
      const products = listed.items;

      const mappedAll = products.map((p) => {
        rememberApiMeta(p);
        return mapApiProduct(p);
      });

      const byId = new Map(mappedAll.map((p) => [p.id, p]));

      const mapList = (list?: typeof products) =>
        (list ?? []).map((p) => {
          rememberApiMeta(p);
          const mapped = mapApiProduct(p);
          byId.set(mapped.id, mapped);
          return mapped;
        });

      const bs = mapList(home.bestSellers);
      const tr = mapList(home.trending);
      const na = mapList(home.newArrivals);

      for (const p of [...bs, ...tr, ...na]) {
        if (!byId.has(p.id)) byId.set(p.id, p);
      }

      replaceArray(shopProducts, [...byId.values()]);
      replaceArray(bestSellerProducts, bs);
      replaceArray(trendingProducts, tr);

      const toTeaser = (p: (typeof mappedAll)[number]) => ({
        id: p.id,
        brand: p.brand,
        name: p.name,
        price: p.price,
        image: p.image,
      });
      replaceArray(bestSellers as { id: string; brand: string; name: string; price: number; image: string }[], bs.map(toTeaser));
      replaceArray(newArrivals as { id: string; brand: string; name: string; price: number; image: string }[], na.map(toTeaser));

      if (home.hero?.length) {
        replaceArray(
          heroSlides,
          home.hero.map((h, i) => ({
            id: i + 1,
            tag: h.eyebrow ?? "NEW",
            title: h.headline ?? "",
            copy: h.subhead ?? "",
            image: h.imageUrl ?? "",
          }))
        );
      }

      if (home.categories?.length) {
        replaceArray(
          homeCategories as { id: string; name: string; image: string }[],
          home.categories.map((c) => ({
            id: c.handle ?? c.id ?? c.name.toLowerCase(),
            name: c.name,
            image: c.image ?? "",
          }))
        );
      }

      lastError = null;
      hydrated = true;
      useCatalogVersion.getState().bump();
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Failed to load catalog";
      console.warn("[catalog] hydrate failed", err);
      throw err;
    }
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function isCatalogHydrated() {
  return hydrated;
}

export function getCatalogHydrateError() {
  return lastError;
}
