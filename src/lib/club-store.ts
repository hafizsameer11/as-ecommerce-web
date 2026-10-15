import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomerTier } from "@/lib/customers-store";

export type ClubTier = {
  id: CustomerTier;
  name: string;
  color: string;
  minSpend: number;      // NGN lifetime spend to qualify
  pointsMultiplier: number; // e.g. 1x, 1.5x, 2x, 3x
  perks: string[];
  active: boolean;
};

export type ClubReward = {
  id: string;
  title: string;
  description: string;
  cost: number;          // points
  category: "shipping" | "credit" | "experience" | "product" | "concierge";
  eligibleTiers: CustomerTier[];
  stock: number | null;  // null = unlimited
  redeemed: number;
  active: boolean;
  createdAt: string;
};

export type ClubRule = {
  earnPerNaira: number;      // base points per ₦1000 spent
  pointValueNaira: number;   // ₦ per point when redeemed as credit
  birthdayBonus: number;
  referralBonus: number;
  reviewBonus: number;
  signupBonus: number;
  expiryMonths: number;
};

export type PointsEntry = {
  id: string;
  customerId: string;
  customerName: string;
  tier: CustomerTier;
  delta: number;
  reason: string;
  at: string;
};

const now = () => new Date().toISOString();
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_TIERS: ClubTier[] = [
  {
    id: "Standard", name: "Standard", color: "#6B7280", minSpend: 0, pointsMultiplier: 1,
    perks: ["Earn 1 point per ₦1,000 spent", "Access to member-only drops"],
    active: true,
  },
  {
    id: "Silver", name: "Silver", color: "#94A3B8", minSpend: 500_000, pointsMultiplier: 1.25,
    perks: ["1.25× points", "Free standard shipping over ₦100k", "Early sale access (24h)"],
    active: true,
  },
  {
    id: "Gold", name: "Gold", color: "#B8862B", minSpend: 1_500_000, pointsMultiplier: 1.75,
    perks: ["1.75× points", "Free express shipping", "Priority concierge queue", "Birthday gift box"],
    active: true,
  },
  {
    id: "Signature", name: "Signature", color: "#0F172A", minSpend: 3_500_000, pointsMultiplier: 3,
    perks: [
      "3× points on every order",
      "Dedicated concierge line",
      "Complimentary global shipping",
      "Invitations to private ASL events",
      "First access to limited pieces",
    ],
    active: true,
  },
];

const DEFAULT_RULES: ClubRule = {
  earnPerNaira: 1,
  pointValueNaira: 25,
  birthdayBonus: 500,
  referralBonus: 1000,
  reviewBonus: 50,
  signupBonus: 250,
  expiryMonths: 24,
};

const DEFAULT_REWARDS: ClubReward[] = [
  {
    id: "rw_ship", title: "Free Express Shipping", description: "One free DHL express shipment on your next order.",
    cost: 400, category: "shipping", eligibleTiers: ["Silver", "Gold", "Signature"],
    stock: null, redeemed: 84, active: true, createdAt: now(),
  },
  {
    id: "rw_credit_10", title: "₦10,000 Store Credit", description: "Redeem points for ₦10,000 in wallet credit.",
    cost: 400, category: "credit", eligibleTiers: ["Standard", "Silver", "Gold", "Signature"],
    stock: null, redeemed: 162, active: true, createdAt: now(),
  },
  {
    id: "rw_credit_50", title: "₦50,000 Store Credit", description: "Serious spender reward - ₦50k wallet credit.",
    cost: 2000, category: "credit", eligibleTiers: ["Gold", "Signature"],
    stock: null, redeemed: 41, active: true, createdAt: now(),
  },
  {
    id: "rw_concierge", title: "Priority Concierge · 30 days", description: "Skip the queue on all concierge requests for a month.",
    cost: 1200, category: "concierge", eligibleTiers: ["Silver", "Gold", "Signature"],
    stock: null, redeemed: 27, active: true, createdAt: now(),
  },
  {
    id: "rw_signature_bag", title: "ASL Signature Leather Pouch", description: "Limited-run leather pouch, hand-stitched in Lagos.",
    cost: 3500, category: "product", eligibleTiers: ["Gold", "Signature"],
    stock: 40, redeemed: 12, active: true, createdAt: now(),
  },
  {
    id: "rw_event", title: "ASL Private Event Invitation", description: "Invitation for two to the next ASL ORIGINALS showcase.",
    cost: 5000, category: "experience", eligibleTiers: ["Signature"],
    stock: 20, redeemed: 6, active: true, createdAt: now(),
  },
];

function seedLedger(): PointsEntry[] {
  const names: Array<[string, CustomerTier]> = [
    ["Adaeze Okafor", "Signature"], ["Tunde Balogun", "Gold"], ["Ifeoma Eze", "Gold"],
    ["Aisha Musa", "Silver"], ["Femi Adegoke", "Signature"], ["Zainab Lawal", "Silver"],
    ["Bola Ademola", "Standard"], ["Kunle Ige", "Gold"], ["Kemi Sanni", "Silver"],
  ];
  const reasons = [
    "Order #ASL-4821 · +earn", "Redeemed: Free Express Shipping", "Birthday bonus",
    "Referred Uche Nwosu", "Order #ASL-4837 · +earn", "Redeemed: ₦10,000 Credit",
    "Review bonus", "Order #ASL-4855 · +earn", "Signature-tier upgrade bonus",
    "Redeemed: Priority Concierge", "Order #ASL-4879 · +earn",
  ];
  const out: PointsEntry[] = [];
  for (let i = 0; i < 22; i++) {
    const [name, tier] = names[i % names.length];
    const reason = reasons[i % reasons.length];
    const isRedeem = reason.startsWith("Redeemed");
    const base = isRedeem ? -(200 + (i % 5) * 200) : 50 + (i * 37) % 800;
    out.push({
      id: `pe_${uid()}`,
      customerId: `cus_${1000 + (i % 42)}`,
      customerName: name,
      tier,
      delta: base,
      reason,
      at: new Date(Date.now() - i * 3.7 * 3600_000).toISOString(),
    });
  }
  return out;
}

type State = {
  tiers: ClubTier[];
  rewards: ClubReward[];
  rules: ClubRule;
  ledger: PointsEntry[];
  updateTier: (id: CustomerTier, patch: Partial<ClubTier>) => void;
  updateRules: (patch: Partial<ClubRule>) => void;
  createReward: (input: Omit<ClubReward, "id" | "createdAt" | "redeemed">) => string;
  updateReward: (id: string, patch: Partial<ClubReward>) => void;
  removeReward: (id: string) => void;
  duplicateReward: (id: string) => void;
  adjustPoints: (customerId: string, customerName: string, tier: CustomerTier, delta: number, reason: string) => void;
};

export const useClub = create<State>()(
  persist(
    (set, get) => ({
      tiers: DEFAULT_TIERS,
      rewards: DEFAULT_REWARDS,
      rules: DEFAULT_RULES,
      ledger: seedLedger(),
      updateTier: (id, patch) => set((s) => ({
        tiers: s.tiers.map((t) => t.id === id ? { ...t, ...patch } : t),
      })),
      updateRules: (patch) => set((s) => ({ rules: { ...s.rules, ...patch } })),
      createReward: (input) => {
        const id = `rw_${uid()}`;
        set((s) => ({ rewards: [{ ...input, id, redeemed: 0, createdAt: now() }, ...s.rewards] }));
        return id;
      },
      updateReward: (id, patch) => set((s) => ({
        rewards: s.rewards.map((r) => r.id === id ? { ...r, ...patch } : r),
      })),
      removeReward: (id) => set((s) => ({ rewards: s.rewards.filter((r) => r.id !== id) })),
      duplicateReward: (id) => {
        const src = get().rewards.find((r) => r.id === id);
        if (!src) return;
        const nid = `rw_${uid()}`;
        set((s) => ({ rewards: [{ ...src, id: nid, title: `${src.title} (copy)`, redeemed: 0, createdAt: now() }, ...s.rewards] }));
      },
      adjustPoints: (customerId, customerName, tier, delta, reason) => set((s) => ({
        ledger: [{ id: `pe_${uid()}`, customerId, customerName, tier, delta, reason, at: now() }, ...s.ledger],
      })),
    }),
    { name: "asl-admin-club-v1" }
  )
);
