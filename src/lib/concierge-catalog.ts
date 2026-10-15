import { getAllProducts, isConciergeProduct, type Product } from "@/lib/shop-data";
import { conciergeCategories } from "@/components/categories/categoryData";

const has = (p: Product, ...words: string[]) => {
  const hay = `${p.name} ${p.brand} ${p.subcategory ?? ""} ${p.category}`.toLowerCase();
  return words.some((w) => hay.includes(w));
};

const matchers: Record<string, (p: Product) => boolean> = {
  sneakers: (p) => p.category === "footwear" || has(p, "sneaker", "dunk", "jordan", "trainer"),
  luxury: (p) => p.category === "clothing" || has(p, "jacket", "hoodie", "coat", "shirt"),
  watches: (p) => has(p, "watch", "g-shock", "rolex", "strap"),
  bags: (p) => has(p, "bag", "backpack", "luggage", "tote", "duffle"),
  eyewear: (p) => has(p, "sunglass", "eyewear", "glasses", "frame"),
  caps: (p) => has(p, "cap", "hat", "beanie"),
  fragrance: (p) => p.category === "fragrances" || has(p, "perfume", "parfum", "cologne", "mist"),
  tech: (p) => has(p, "tech", "audio", "headphone", "earbud", "gadget"),
  toys: (p) => has(p, "toy", "figure", "collectible", "art"),
  limited: (p) => isConciergeProduct(p),
  accessories: (p) => p.category === "accessories" || has(p, "belt", "wallet", "jewel", "chain"),
};

export function getConciergeCategory(id: string) {
  return conciergeCategories.find((c) => c.id === id);
}

/** Products that can be sourced within a concierge category. Never returns empty. */
export function getConciergeProducts(id: string): Product[] {
  const all = getAllProducts();
  const match = matchers[id];
  const picked = match ? all.filter(match) : [];
  if (picked.length >= 4) return picked;
  // Deterministic fallback so every category has browsable pieces.
  const extras = all.filter((p) => !picked.includes(p)).slice(0, 8 - picked.length);
  return [...picked, ...extras];
}
