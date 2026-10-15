import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";
import { catalogApi, type ApiReview } from "@/lib/api/catalog";

export type Review = {
  id: string;
  author: string;
  initials: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
  size?: string;
  fit?: "Runs small" | "True to size" | "Runs large";
};

function mapApiReview(r: ApiReview): Review {
  const date =
    typeof r.date === "string"
      ? new Date(r.date).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
      : new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
  const fit = r.fit as Review["fit"] | null | undefined;
  return {
    id: r.id,
    author: r.author,
    initials: r.initials || r.author.slice(0, 2).toUpperCase(),
    rating: r.rating,
    title: r.title,
    body: r.body,
    date,
    verified: r.verified,
    helpful: r.helpful,
    size: r.size ?? undefined,
    fit: fit ?? undefined,
  };
}

const FIT_TO_API: Record<string, string> = {
  "Runs small": "runs_small",
  "True to size": "true_to_size",
  "Runs large": "runs_large",
};

/* ---------- User-submitted / cached reviews ---------- */

export type UserReview = Omit<Review, "date" | "id" | "helpful" | "initials"> & {
  productId: string;
};

type UserReviewsState = {
  byProduct: Record<string, Review[]>;
  add: (r: UserReview) => void;
  clear: (productId: string) => void;
  /** POST /store/products/:id/reviews */
  submit: (r: UserReview) => Promise<{ ok: boolean; message?: string }>;
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const useUserReviews = create<UserReviewsState>()(
  persist(
    (set) => ({
      byProduct: {},
      add: (r) =>
        set((s) => {
          const list = s.byProduct[r.productId] ?? [];
          const entry: Review = {
            id: `u-${r.productId}-${Date.now()}`,
            author: r.author,
            initials: initialsOf(r.author),
            rating: r.rating,
            title: r.title,
            body: r.body,
            date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
            verified: r.verified ?? false,
            helpful: 0,
            size: r.size,
            fit: r.fit,
          };
          return { byProduct: { ...s.byProduct, [r.productId]: [entry, ...list] } };
        }),
      clear: (productId) =>
        set((s) => {
          const { [productId]: _, ...rest } = s.byProduct;
          return { byProduct: rest };
        }),
      submit: async (r) => {
        try {
          const res = await catalogApi.createReview(r.productId, {
            rating: r.rating,
            title: r.title,
            body: r.body,
            size: r.size,
            fit: r.fit ? FIT_TO_API[r.fit] : undefined,
          });
          const mapped = mapApiReview(res);
          set((s) => {
            const list = s.byProduct[r.productId] ?? [];
            return { byProduct: { ...s.byProduct, [r.productId]: [mapped, ...list] } };
          });
          return { ok: true, message: res.message };
        } catch (err) {
          // Optimistic local fallback when offline / unauthenticated
          set((s) => {
            const list = s.byProduct[r.productId] ?? [];
            const entry: Review = {
              id: `u-${r.productId}-${Date.now()}`,
              author: r.author,
              initials: initialsOf(r.author),
              rating: r.rating,
              title: r.title,
              body: r.body,
              date: new Date().toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }),
              verified: r.verified ?? false,
              helpful: 0,
              size: r.size,
              fit: r.fit,
            };
            return { byProduct: { ...s.byProduct, [r.productId]: [entry, ...list] } };
          });
          return { ok: false, message: err instanceof Error ? err.message : "Could not submit review" };
        }
      },
    }),
    { name: "asl-user-reviews" }
  )
);

export function useProductReviews(productId: string) {
  const pending = useUserReviews((s) => s.byProduct[productId]) ?? [];
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [distribution, setDistribution] = useState<Array<{ star: number; count: number; pct: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    catalogApi
      .listReviews(productId, { pageSize: 50, sort: "recent" })
      .then(({ data }) => {
        if (cancelled) return;
        const items = (data.items ?? []).map(mapApiReview);
        const dist = (data.summary?.distribution ?? []).map((d) => ({
          star: d.star,
          count: d.count,
          pct: data.summary.count ? Math.round((d.count / data.summary.count) * 100) : 0,
        }));
        setReviews(items);
        setAverage(data.summary?.average ?? 0);
        setCount(data.summary?.count ?? items.length);
        setDistribution(dist.length ? dist : [5, 4, 3, 2, 1].map((star) => ({ star, count: 0, pct: 0 })));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[reviews]", err);
        setReviews([]);
        setAverage(0);
        setCount(0);
        setDistribution([5, 4, 3, 2, 1].map((star) => ({ star, count: 0, pct: 0 })));
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const all = [...pending.filter((p) => !reviews.some((r) => r.id === p.id)), ...reviews];
  return {
    reviews: all,
    average: count ? average : all.length ? all.reduce((s, r) => s + r.rating, 0) / all.length : 0,
    count: count || all.length,
    breakdown: distribution.length
      ? distribution
      : (() => {
          const buckets: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          for (const r of all) buckets[r.rating]++;
          const total = all.length;
          return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: buckets[star],
            pct: total ? Math.round((buckets[star] / total) * 100) : 0,
          }));
        })(),
    loading,
    markHelpful: (id: string) => {
      void catalogApi.markReviewHelpful(id).catch(() => undefined);
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, helpful: r.helpful + 1 } : r)));
    },
    report: (id: string) => {
      void catalogApi.reportReview(id).catch(() => undefined);
    },
  };
}

/** Sync helpers kept for call sites that have not switched to useProductReviews yet. */
export function getAllReviews(_productId: string): Review[] {
  return [];
}

export function getRatingBreakdown(productId: string) {
  const revs = getAllReviews(productId);
  const buckets: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of revs) buckets[r.rating]++;
  const total = revs.length;
  return [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: buckets[star],
    pct: total ? Math.round((buckets[star] / total) * 100) : 0,
  }));
}

/* ---------- Notify me (POST/DELETE /store/products/:id/notify-me) ---------- */

type NotifyState = {
  items: Record<string, string>;
  add: (productId: string, size?: string) => void;
  remove: (productId: string, size?: string) => void;
  has: (productId: string) => boolean;
};

export const useNotify = create<NotifyState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (id, size) => {
        set((s) => ({ items: { ...s.items, [id]: new Date().toISOString() } }));
        void catalogApi.notifyMe(id, size).catch((err) => {
          console.warn("[notify-me]", err);
          set((s) => {
            const { [id]: _, ...rest } = s.items;
            return { items: rest };
          });
        });
      },
      remove: (id, size) => {
        set((s) => {
          const { [id]: _, ...rest } = s.items;
          return { items: rest };
        });
        void catalogApi.stopNotifyMe(id, size).catch((err) => console.warn("[notify-me]", err));
      },
      has: (id) => Boolean(get().items[id]),
    }),
    { name: "asl-notify" }
  )
);
