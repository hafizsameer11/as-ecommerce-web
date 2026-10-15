import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceApi } from "@/lib/api/commerce";
import { useAuth } from "@/lib/auth-store";

export type MintedCoupon = {
  code: string;
  pct: number;
  label: string;
  source: "rewards" | "promo" | "referral";
};

export function mintCouponCode(prefix: string) {
  return `${prefix}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

type State = {
  coupons: MintedCoupon[];
  add: (c: MintedCoupon) => void;
  find: (code: string) => MintedCoupon | undefined;
  remove: (code: string) => void;
  refresh: () => Promise<void>;
};

function mapSource(s?: string): MintedCoupon["source"] {
  if (s === "referral") return "referral";
  if (s === "rewards" || s === "reward") return "rewards";
  return "promo";
}

export const useMyCoupons = create<State>()(
  persist(
    (set, get) => ({
      coupons: [],
      add: (c) =>
        set((s) => (s.coupons.some((x) => x.code === c.code) ? s : { coupons: [c, ...s.coupons] })),
      find: (code) => get().coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()),
      remove: (code) => set((s) => ({ coupons: s.coupons.filter((c) => c.code !== code) })),
      refresh: async () => {
        if (!useAuth.getState().isLoggedIn) return;
        try {
          const rows = await commerceApi.myCoupons();
          set({
            coupons: rows.map((r) => ({
              code: r.code,
              pct: r.pct ?? (r.type === "percent" ? r.value : 0),
              label: r.label,
              source: mapSource(r.source),
            })),
          });
        } catch (err) {
          console.warn("[my-coupons] refresh failed", err);
        }
      },
    }),
    { name: "asl-my-coupons-v1" }
  )
);
