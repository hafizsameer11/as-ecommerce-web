import { useEffect, useState } from "react";
import { catalogApi } from "@/lib/api/catalog";

export type SizeGuideScope = "brand" | "category";

export type SizeGuideEntry = {
  id: string;
  scope: SizeGuideScope;
  target: string;
  note: string;
  chartUrl?: string;
};

type CacheKey = string;
const cache = new Map<CacheKey, SizeGuideEntry | null>();
const inflight = new Map<CacheKey, Promise<SizeGuideEntry | null>>();

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function keyOf(brand: string, category: string) {
  return `${slugify(brand)}|${slugify(category)}`;
}

function mapGuide(raw: Record<string, unknown>): SizeGuideEntry {
  return {
    id: String(raw.id ?? ""),
    scope: (raw.scope as SizeGuideScope) || "category",
    target: String(raw.target ?? ""),
    note: String(raw.note ?? ""),
    chartUrl: raw.chartUrl ? String(raw.chartUrl) : undefined,
  };
}

/** Brand guide wins over category guide (API returns sorted that way). */
async function fetchGuide(brand: string, category: string): Promise<SizeGuideEntry | null> {
  const key = keyOf(brand, category);
  if (cache.has(key)) return cache.get(key) ?? null;
  const existing = inflight.get(key);
  if (existing) return existing;

  const p = (async () => {
    try {
      const brandKey = brand ? slugify(brand) : undefined;
      const categoryKey = category ? slugify(category) : undefined;
      const rows = await catalogApi.sizeGuides({
        brand: brandKey,
        category: categoryKey,
      });
      const list = (rows as Record<string, unknown>[]).map(mapGuide).filter((g) => g.note);
      const brandHit = list.find((g) => g.scope === "brand");
      const catHit = list.find((g) => g.scope === "category");
      const guide = brandHit ?? catHit ?? list[0] ?? null;
      cache.set(key, guide);
      return guide;
    } catch (err) {
      console.warn("[size-guide] fetch failed", err);
      cache.set(key, null);
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, p);
  return p;
}

/** Hook: loads the size guide note for a product brand/category from the store API. */
export function useSizeGuideFor(brand: string, category: string) {
  const key = keyOf(brand, category);
  const [guide, setGuide] = useState<SizeGuideEntry | null>(() => cache.get(key) ?? null);

  useEffect(() => {
    let cancelled = false;
    if (!brand && !category) {
      setGuide(null);
      return;
    }
    if (cache.has(key)) {
      setGuide(cache.get(key) ?? null);
      return;
    }
    void fetchGuide(brand, category).then((g) => {
      if (!cancelled) setGuide(g);
    });
    return () => {
      cancelled = true;
    };
  }, [brand, category, key]);

  return guide;
}
