import type { Product } from "./shop-data";
import { loyaltyApi, koboToNaira, type ApiDrop } from "@/lib/api/loyalty";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import type { ApiProductCard } from "@/lib/api/catalog";

export type Drop = {
  id: string;
  product: Product;
  /** ISO date the piece becomes available */
  releaseAt: string;
  /** Total pairs/pieces allocated for this drop */
  allocation: number;
  /** How many are already reserved */
  reservedCount: number;
  teaser: string;
  depositPct: number;
  deposit: number;
  balance: number;
};

/** Deposit rate required to reserve an upcoming drop (fallback when API omits pct). */
export const DEPOSIT_RATE = 0.5;

export const depositFor = (price: number, pct = DEPOSIT_RATE * 100) => Math.round(price * (pct / 100));
export const balanceFor = (price: number, pct = DEPOSIT_RATE * 100) => price - depositFor(price, pct);

let cache: Drop[] = [];
let hydrated = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeDrops(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function mapDrop(d: ApiDrop): Drop {
  const card = {
    id: d.product.id,
    productId: d.product.productId,
    brand: d.product.brand,
    name: d.product.name,
    price: d.product.price,
    image: d.product.image,
    category: d.product.category ?? "drops",
    sizes: d.product.sizes ?? [],
    colors: [],
    availability: "Pre Order",
    isConcierge: false,
  } as unknown as ApiProductCard;
  rememberApiMeta(card);
  const product = mapApiProduct(card);
  const pct = d.depositPct ?? 50;
  const deposit = d.deposit != null ? koboToNaira(d.deposit) : depositFor(product.price, pct);
  const balance = d.balance != null ? koboToNaira(d.balance) : product.price - deposit;
  return {
    id: d.id,
    product,
    releaseAt: typeof d.releaseAt === "string" ? d.releaseAt : new Date(d.releaseAt).toISOString(),
    allocation: d.allocation,
    reservedCount: d.reservedCount,
    teaser: d.teaser || "Limited allocation — reserve early.",
    depositPct: pct,
    deposit,
    balance,
  };
}

export async function hydrateDrops() {
  if (hydrated) return;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const rows = await loyaltyApi.listDrops();
      cache = rows.map(mapDrop);
      hydrated = true;
      notify();
    } catch (err) {
      console.warn("[drops] hydrate failed", err);
      hydrated = true;
      notify();
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

/** Deterministic set of upcoming drops (API-backed after hydrate). */
export function getDrops(): Drop[] {
  return cache;
}

export function getDropById(id: string) {
  return getDrops().find((d) => d.id === id);
}

export function countdownParts(releaseAt: string, now: number) {
  const diff = Math.max(0, new Date(releaseAt).getTime() - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    released: diff === 0,
  };
}

export function formatDropDate(releaseAt: string, short = false) {
  return new Date(releaseAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: short ? "short" : "long",
    year: "numeric",
  });
}
