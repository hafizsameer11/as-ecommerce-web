import type { ApiCollection, HomeSlot } from "@/lib/api/catalog";

/** Filled from GET /store/home via catalog-hydrate. */
export const homeSlots: HomeSlot[] = [];

export const homeCollections: {
  hero: ApiCollection[];
  row1: ApiCollection[];
  row2: ApiCollection[];
} = {
  hero: [],
  row1: [],
  row2: [],
};

export function slotKey(slot: HomeSlot): string {
  return (slot.id || slot.headline || "").toLowerCase();
}

export function isComingSoonSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("coming_soon") || k.includes("coming-soon") || /reserve|drops/i.test(slot.headline ?? "");
}

export function isConciergeSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("concierge") || /fashion\s*concierge/i.test(slot.headline ?? "");
}

export function isSneakerEditSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("sneaker") || /sneaker/i.test(slot.headline ?? "");
}

export function isWatchEditSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("watch") || /watch/i.test(slot.headline ?? "");
}

export function isBackInStockSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("back_in_stock") || k.includes("restock") || /back in\s*stock/i.test(slot.headline ?? "");
}

export function isBrandsSlot(slot: HomeSlot) {
  const k = slotKey(slot);
  return k.includes("brand") || /discover more\s*brands/i.test(slot.headline ?? "");
}
