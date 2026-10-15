import { create } from "zustand";
import { Star, Wallet, ShoppingBag, Coins, Users, Megaphone, LucideIcon } from "lucide-react";
import { loyaltyApi, koboToNaira, type ClubSummary } from "@/lib/api/loyalty";

export type Tier = { id: string; label: string; pts: number };

export type RewardsSummary = {
  points: number;
  pointsValue: number;
  credit: number;
  tier: string;
  progressPts: number;
  targetPts: number;
  toNext: number;
  nextTier: string;
  memberSince: string;
};

export type Activity = {
  id: string;
  title: string;
  detail: string;
  amount: string;
  negative?: boolean;
  credit?: boolean;
  date: string;
  Icon: LucideIcon;
};

const FALLBACK_TIERS: Tier[] = [
  { id: "Standard", label: "Standard", pts: 0 },
  { id: "Silver", label: "Silver", pts: 5000 },
  { id: "Gold", label: "Gold", pts: 10000 },
  { id: "Signature", label: "Signature", pts: 20000 },
];

const FALLBACK_SUMMARY: RewardsSummary = {
  points: 0,
  pointsValue: 0,
  credit: 0,
  tier: "Standard",
  progressPts: 0,
  targetPts: 5000,
  toNext: 5000,
  nextTier: "Silver",
  memberSince: "",
};

function iconFor(kind: string): LucideIcon {
  if (kind.includes("redeem") || kind === "redemption") return Coins;
  if (kind.includes("wallet") || kind.includes("credit")) return Wallet;
  if (kind.includes("order") || kind.includes("purchase")) return ShoppingBag;
  return Star;
}

function mapSummary(s: ClubSummary): RewardsSummary {
  const spend = koboToNaira(s.spend12m ?? 0);
  const nextMin = s.nextTier ? koboToNaira(s.nextTier.minSpend) : spend;
  return {
    points: s.points ?? 0,
    pointsValue: koboToNaira(s.pointsValue ?? 0),
    credit: koboToNaira(s.credit ?? 0),
    tier: s.tier?.name ?? "Standard",
    progressPts: Math.round(spend),
    targetPts: Math.round(nextMin || spend || 1),
    toNext: Math.max(0, Math.round(koboToNaira(s.spendToNext ?? 0))),
    nextTier: s.nextTier?.name ?? s.tier?.name ?? "Standard",
    memberSince: s.memberSince
      ? new Date(s.memberSince).toLocaleDateString("en-NG", { month: "short", year: "numeric" })
      : "",
  };
}

function mapTiers(s: ClubSummary | null): Tier[] {
  if (!s?.tiers?.length) return FALLBACK_TIERS;
  return s.tiers.map((t) => ({
    id: t.id,
    label: t.name,
    pts: Math.round(koboToNaira(t.minSpend ?? 0)),
  }));
}

type HistoryRow = {
  id: string;
  kind?: string;
  title?: string;
  detail?: string;
  delta?: number;
  negative?: boolean;
  createdAt?: string;
};

type State = {
  tiers: Tier[];
  summary: RewardsSummary;
  activities: Activity[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

export const useClubRewards = create<State>()((set) => ({
  tiers: FALLBACK_TIERS,
  summary: FALLBACK_SUMMARY,
  activities: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const [summary, history] = await Promise.all([
        loyaltyApi.clubSummary(),
        loyaltyApi.clubHistory() as Promise<HistoryRow[] | { data?: HistoryRow[] }>,
      ]);
      const rows = Array.isArray(history) ? history : Array.isArray(history?.data) ? history.data : [];
      const activities: Activity[] = rows.slice(0, 20).map((e) => {
        const delta = Number(e.delta ?? 0);
        const neg = e.negative ?? delta < 0;
        return {
          id: String(e.id),
          title: e.title || "Points",
          detail: e.detail || "",
          amount: `${delta > 0 ? "+" : ""}${delta.toLocaleString()} pts`,
          negative: neg,
          date: e.createdAt
            ? new Date(e.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })
            : "",
          Icon: iconFor(String(e.kind ?? e.title ?? "")),
        };
      });
      set({
        summary: mapSummary(summary),
        tiers: mapTiers(summary),
        activities,
        hydrated: true,
      });
    } catch (err) {
      console.warn("[rewards] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));

/** @deprecated Prefer useClubRewards — kept for gradual migration */
export const tiers = FALLBACK_TIERS;
export const rewardsSummary = FALLBACK_SUMMARY;
export const activities: Activity[] = [];

export const earnMethods = [
  { title: "Complete concierge requests", desc: "Earn points when your request is completed", Icon: ShoppingBag },
  { title: "Make a purchase", desc: "Earn points on every eligible purchase", Icon: Coins },
  { title: "Refer a friend", desc: "Earn points when your friend places an order", Icon: Users },
  { title: "Join special promotions", desc: "Earn bonus points during campaigns", Icon: Megaphone },
];
