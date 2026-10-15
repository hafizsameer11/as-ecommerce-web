import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CustomerTier = "Signature" | "Gold" | "Silver" | "Standard";
export type CustomerStatus = "active" | "vip" | "flagged" | "blocked";

export type CustomerAddress = {
  label: string;
  line1: string;
  city: string;
  state: string;
  country: string;
};

export type CustomerNote = {
  id: string;
  author: string;
  at: string;
  body: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  tier: CustomerTier;
  status: CustomerStatus;
  orders: number;
  concierge: number;
  spend: number;      // total lifetime spend, NGN
  aov: number;        // average order value, NGN
  walletBalance: number;
  loyaltyPoints: number;
  lastOrderAt: string;
  createdAt: string;
  marketingOptIn: boolean;
  addresses: CustomerAddress[];
  notes: CustomerNote[];
  tags: string[];
};

const FIRST = ["Adaeze","Chike","Ifeoma","Tunde","Ngozi","Bola","Kola","Amaka","Uche","Femi","Aisha","Sade","Emeka","Zainab","Yemi","Kunle","Chidera","Obinna","Halima","Ibrahim","Fola","Ronke","Damilola","Segun","Kemi","Ada","Nkechi","Bayo"];
const LAST = ["Okafor","Bello","Adeyemi","Balogun","Eze","Obi","Adegoke","Nwosu","Musa","Lawal","Ogundipe","Ilori","Oduya","Ademola","Chukwu","Ojo","Sanni","Umeh","Alabi","Ige","Fashola","Ibrahim"];
const CITIES: [string, string][] = [
  ["Lagos","LA"],["Abuja","FC"],["Port Harcourt","RI"],["Ibadan","OY"],
  ["Enugu","EN"],["Kano","KN"],["Benin City","ED"],["Uyo","AK"],
  ["London","GB"],["Accra","GH"],["Dubai","AE"],
];
const TAGS_POOL = ["watches","sneakers","fragrance","concierge","fashion","gifting","corporate"];

function pick<T>(arr: T[], i: number) { return arr[i % arr.length]; }
function rand(seed: number) { let x = Math.sin(seed) * 10000; return x - Math.floor(x); }

function seedCustomers(): Customer[] {
  const list: Customer[] = [];
  for (let i = 0; i < 42; i++) {
    const first = pick(FIRST, i * 3 + 1);
    const lastName = pick(LAST, i * 5 + 2);
    const [city, code] = pick(CITIES, i + 7);
    const orders = Math.max(0, Math.floor(rand(i + 1) * 18));
    const concierge = Math.floor(rand(i + 5) * 4);
    const spendBase = orders * (60_000 + Math.floor(rand(i + 9) * 350_000)) + concierge * 850_000;
    const spend = Math.round(spendBase / 1000) * 1000;
    const aov = orders > 0 ? Math.round(spend / orders) : 0;
    const tier: CustomerTier =
      spend >= 3_500_000 ? "Signature" :
      spend >= 1_500_000 ? "Gold" :
      spend >= 500_000 ? "Silver" : "Standard";
    const status: CustomerStatus =
      i % 17 === 0 ? "flagged" :
      i % 23 === 0 ? "blocked" :
      tier === "Signature" || tier === "Gold" ? "vip" : "active";
    const createdDays = 60 + Math.floor(rand(i + 11) * 720);
    const lastDays = Math.floor(rand(i + 13) * Math.min(createdDays, 90));
    const created = new Date(Date.now() - createdDays * 86400000);
    const lastDate = new Date(Date.now() - lastDays * 86400000);
    const handle = `${first}.${lastName}`.toLowerCase().replace(/\s+/g, "");
    list.push({
      id: `cus_${String(1000 + i)}`,
      name: `${first} ${lastName}`,
      email: `${handle}@example.com`,
      phone: `+234 ${800 + (i % 90)} ${String(1000000 + i * 137).slice(0, 7)}`,
      city,
      country: code === "GB" ? "United Kingdom" : code === "GH" ? "Ghana" : code === "AE" ? "UAE" : "Nigeria",
      tier,
      status,
      orders,
      concierge,
      spend,
      aov,
      walletBalance: Math.round(rand(i + 3) * 250_000 / 500) * 500,
      loyaltyPoints: Math.floor(spend / 1000),
      lastOrderAt: lastDate.toISOString(),
      createdAt: created.toISOString(),
      marketingOptIn: i % 4 !== 0,
      addresses: [
        { label: "Home", line1: `${10 + i} ${lastName} Close`, city, state: city, country: code === "GB" ? "United Kingdom" : code === "GH" ? "Ghana" : code === "AE" ? "UAE" : "Nigeria" },
      ],
      notes: i % 5 === 0 ? [{
        id: `n_${i}`, author: "Concierge", at: lastDate.toISOString(),
        body: "VIP client - prefers WhatsApp updates. Signature-tier sourcing priority.",
      }] : [],
      tags: [pick(TAGS_POOL, i), pick(TAGS_POOL, i + 3)].filter((v, ix, a) => a.indexOf(v) === ix),
    });
  }
  return list;
}

type State = {
  customers: Customer[];
  setStatus: (id: string, s: CustomerStatus) => void;
  setTier: (id: string, t: CustomerTier) => void;
  toggleMarketing: (id: string) => void;
  addNote: (id: string, body: string, author?: string) => void;
  removeNote: (id: string, noteId: string) => void;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
  adjustWallet: (id: string, delta: number) => void;
  remove: (id: string) => void;
  reset: () => void;
};

export const useCustomers = create<State>()(
  persist(
    (set) => ({
      customers: seedCustomers(),
      setStatus: (id, s) => set((st) => ({ customers: st.customers.map((c) => c.id === id ? { ...c, status: s } : c) })),
      setTier: (id, t) => set((st) => ({ customers: st.customers.map((c) => c.id === id ? { ...c, tier: t } : c) })),
      toggleMarketing: (id) => set((st) => ({ customers: st.customers.map((c) => c.id === id ? { ...c, marketingOptIn: !c.marketingOptIn } : c) })),
      addNote: (id, body, author = "Admin") => set((st) => ({
        customers: st.customers.map((c) => c.id === id ? {
          ...c, notes: [{ id: `n_${Date.now().toString(36)}`, author, at: new Date().toISOString(), body }, ...c.notes],
        } : c),
      })),
      removeNote: (id, noteId) => set((st) => ({
        customers: st.customers.map((c) => c.id === id ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c),
      })),
      addTag: (id, tag) => set((st) => ({
        customers: st.customers.map((c) => c.id === id && !c.tags.includes(tag) ? { ...c, tags: [...c.tags, tag] } : c),
      })),
      removeTag: (id, tag) => set((st) => ({
        customers: st.customers.map((c) => c.id === id ? { ...c, tags: c.tags.filter((t) => t !== tag) } : c),
      })),
      adjustWallet: (id, delta) => set((st) => ({
        customers: st.customers.map((c) => c.id === id ? { ...c, walletBalance: Math.max(0, c.walletBalance + delta) } : c),
      })),
      remove: (id) => set((st) => ({ customers: st.customers.filter((c) => c.id !== id) })),
      reset: () => set({ customers: seedCustomers() }),
    }),
    { name: "asl-admin-customers-v1" }
  )
);
