import { getApiRating, getApiSizeAvailability, isApiOutOfStock } from "@/lib/api/product-mapper";
import pDailyPaperTee from "@/assets/p-daily-paper-tee.png";
import pNikeHoodieGreen from "@/assets/p-nike-hoodie-green.png";
import pAapeJacket from "@/assets/p-aape-jacket.png";
import pRepresentDenim from "@/assets/p-represent-denim.png";
import pEssentialsShorts from "@/assets/p-essentials-shorts.png";
import pNikeDunk from "@/assets/p-nike-dunk.png";
import pRepresentHoodie from "@/assets/p-represent-hoodie.png";
import pAmiriCap from "@/assets/p-amiri-cap.png";
import pTee from "@/assets/p-tee.png";
import pTee2 from "@/assets/p-tee2.png";
import pHoodie from "@/assets/p-hoodie.png";
import pSneaker from "@/assets/p-sneaker.png";
import pSneakerBlack from "@/assets/p-sneaker-black.png";
import pRunnerGrey from "@/assets/p-runner-grey.png";
import pLoafer from "@/assets/p-loafer.png";
import pCap from "@/assets/p-cap.png";
import pSlides from "@/assets/p-slides.png";
import pWatch from "@/assets/p-watch.png";
import pWatch2 from "@/assets/p-watch2.png";
import pFragrance from "@/assets/p-fragrance.png";

export type ColorOption = {
  name: string;
  hex: string;
};

export type Product = {
  id: string;
  brand: string;
  /** Storefront/API brand slug when available (size guides key off this). */
  brandHandle?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  sizes: string[];
  colors: ColorOption[];
  availability: "In Stock" | "Pre Order" | "Limited Pieces" | "Restocked";
  isConcierge?: boolean;
  originalPrice?: number;
  description?: string;
  features?: string[];
  styleCode?: string;
  gallery?: string[];
  sizeLabels?: Record<string, string>;
  modelFit?: string;
};

const STANDARD_SIZE_NAMES: Record<string, string> = {
  XXS: "XXSmall", XS: "XSmall", S: "Small", M: "Medium",
  L: "Large", XL: "XLarge", XXL: "XXLarge", XXXL: "XXXLarge",
};

export const DESIGNER_CLOTHING_SIZE_LABELS: Record<string, string> = {
  XXS: "XXS (42)",
  XS: "XS (44)",
  S: "S (46)",
  M: "M (48)",
  L: "L (50)",
  XL: "XL (52)",
  XXL: "XXL (54)",
  XXXL: "XXXL (56)",
};

export function getProductSizeLabel(product: Product, size: string, customLabels?: Record<string, string>) {
  const custom = customLabels?.[size]?.trim();
  if (custom) return custom;
  const productLabel = product.sizeLabels?.[size]?.trim();
  if (productLabel) return productLabel;
  const standardName = STANDARD_SIZE_NAMES[size];
  return product.category === "clothing" && standardName ? standardName : size;
}

export function formatCartSize(size: string) {
  return STANDARD_SIZE_NAMES[size] ?? size;
}

export const formatNaira = (n: number) =>
  "₦" + new Intl.NumberFormat("en-NG").format(n);

export const categories = [
  { id: "clothing", name: "Clothing", itemCount: 342 },
  { id: "footwear", name: "Footwear", itemCount: 186 },
  { id: "accessories", name: "Accessories", itemCount: 94 },
  { id: "fragrances", name: "Fragrances", itemCount: 47 },
  { id: "sale", name: "Sale", itemCount: 24 },
];

export const subCategories: Record<string, string[]> = {
  clothing: [
    "All clothing",
    "T-shirts",
    "Tops",
    "Shirts",
    "Polo Shirts",
    "Hoodies & Sweatshirts",
    "Jackets & Jumpers",
    "Jorts/shorts",
    "Jeans & Trousers",
    "Underwear",
    "Swim Shorts",
  ],
  footwear: ["All footwear", "Sneakers & Trainers", "Shoes", "Sandals", "Flip Flops & Sliders"],
  accessories: ["All accessories", "Sunglasses", "Hats & Caps", "Bags", "Socks, Wallets & Belts", "Gloves & Scarves", "Watches"],
  fragrances: ["All fragrances", "Perfumes", "Body Mists", "Deodorants", "Gift Sets"],
  sale: ["Clothing", "Footwear", "Accessories", "Fragrances"],
};

export const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

export const colorOptions: ColorOption[] = [
  { name: "Black", hex: "#0a0a0a" },
  { name: "White", hex: "#ffffff" },
  { name: "Grey", hex: "#808080" },
  { name: "Navy", hex: "#1a3a5f" },
  { name: "Green", hex: "#2d5a3d" },
  { name: "Brown", hex: "#8b6f5e" },
  { name: "Beige", hex: "#edebdf" },
  { name: "Red", hex: "#c44569" },
  { name: "Multicolor", hex: "linear" },
];

export const priceRanges = [
  { id: "under-100k", label: "Under ₦100,000", min: 0, max: 100000 },
  { id: "100k-250k", label: "₦100,000 - ₦250,000", min: 100000, max: 250000 },
  { id: "250k-500k", label: "₦250,000 - ₦500,000", min: 250000, max: 500000 },
  { id: "above-500k", label: "₦500,000 and above", min: 500000, max: Infinity },
];

export const availabilityOptions = [
  "In Stock",
  "Pre Order",
  "Limited Pieces",
  "Restocked",
] as const;

export const brands = [
  "AAPE",
  "AMIRI",
  "AXEL ARIGATO",
  "CASIO",
  "COMMON PROJECTS",
  "CREED",
  "DAILY PAPER",
  "DIOR",
  "ESSENTIALS",
  "G-SHOCK",
  "GUCCI",
  "NEW ERA",
  "NIKE",
  "REPRESENT",
  "TOM FORD",
];


export const sortOptions = [
  { id: "newest", label: "Newest Arrivals" },
  { id: "price-low", label: "Price: Low to High" },
  { id: "price-high", label: "Price: High to Low" },
  { id: "name-az", label: "Name: A-Z" },
];

export const shopProducts: Product[] = [];

export const bestSellerProducts: Product[] = [];

export const trendingProducts: Product[] = [];

export function getProductsByCategory(categoryId: string, sub?: string) {
  let list: Product[];
  if (categoryId === "best-sellers") list = bestSellerProducts;
  else if (categoryId === "trending") list = trendingProducts;
  else if (categoryId === "all" || categoryId === "new") list = shopProducts;
  else if (categoryId === "sale" || categoryId === "sales") list = shopProducts.filter((p) => isOnSale(p));
  else list = shopProducts.filter((p) => p.category === categoryId);
  if (sub) list = list.filter((p) => p.subcategory === sub);
  return list;
}

export function getSaleInfo(product: Product): { originalPrice?: number; discountPct?: number } {
  if (product.originalPrice) {
    const pct = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    return { originalPrice: product.originalPrice, discountPct: pct };
  }
  return {};
}

export function isOnSale(product: Product) {
  return getSaleInfo(product).discountPct !== undefined;
}

export function getProductRating(id: string) {
  const fromApi = getApiRating(id);
  if (fromApi) return fromApi;
  return { rating: 0, reviews: 0 };
}

export function getProductGallery(product: Product): string[] {
  if (product.gallery && product.gallery.length) return product.gallery;
  return product.image ? [product.image] : [];
}

export function getProductCopy(product: Product): { description: string; features: string[]; styleCode: string } {
  const styleCode = product.styleCode ?? `ASL-${product.id.toUpperCase()}`;
  if (product.description && product.features) {
    return { description: product.description, features: product.features, styleCode };
  }
  const c = product.category;
  let description: string;
  let features: string[];
  if (c === "footwear") {
    description = `The ${product.brand} ${product.name} pairs an iconic silhouette with modern construction. Premium uppers, cushioned midsole and a durable rubber outsole make it built for the everyday rotation.`;
    features = [
      "Premium leather / textile upper",
      "Cushioned foam midsole for all-day wear",
      "Durable rubber outsole for grip and traction",
      "Padded collar for step-in comfort",
      "Signature branding at heel and tongue",
    ];
  } else if (c === "clothing") {
    description = `The ${product.brand} ${product.name} blends heritage tailoring with everyday comfort. Cut from premium fabric with a refined finish, it layers easily across your rotation.`;
    features = [
      "Premium fabric with soft hand-feel",
      "Tailored, modern fit",
      "Ribbed trims for shape retention",
      "Signature label detailing",
      "Machine wash cold, tumble dry low",
    ];
  } else if (c === "fragrances") {
    description = `${product.name} - an evocative composition by ${product.brand}. A bold, long-lasting scent designed to leave a signature impression from day to night.`;
    features = [
      "Sourced 100% authentic",
      "Rich, long-lasting sillage",
      "Sealed, batch-coded bottle",
      "Ships in original packaging",
      "Ideal for daily or occasion wear",
    ];
  } else {
    description = `The ${product.brand} ${product.name} finishes any look with intent. Crafted from premium materials with attention to every stitch, seam and edge.`;
    features = [
      "Premium materials",
      "Handcrafted detailing",
      "Timeless silhouette",
      "Sourced 100% authentic",
      "Original packaging included",
    ];
  }
  return { description, features, styleCode };
}


import subSunglasses from "@/assets/sub-sunglasses.png";
import subBags from "@/assets/sub-bags.png";
import subSocks from "@/assets/sub-socks.png";
import subGloves from "@/assets/sub-gloves.png";
import subFragMen from "@/assets/sub-frag-men.png";
import subFragWomen from "@/assets/sub-frag-women.png";
import subFragUnisex from "@/assets/sub-frag-unisex.png";
import subFragLuxury from "@/assets/sub-frag-luxury.png";
import subFragBest from "@/assets/sub-frag-best.png";
import subFragNew from "@/assets/sub-frag-new.png";
import subFragTravel from "@/assets/sub-frag-travel.png";

const subcategoryThumbnailOverrides: Record<string, Record<string, string>> = {
  clothing: {
    "All clothing": pHoodie,
    "T-shirts": pDailyPaperTee,
    "Tops": pTee2,
    "Shirts": pTee2,
    "Polo Shirts": pTee,
    "Hoodies & Sweatshirts": pRepresentHoodie,
    "Jackets & Jumpers": pAapeJacket,
    "Jorts/shorts": pEssentialsShorts,
    "Jeans & Trousers": pRepresentDenim,
    "Underwear": pTee,
    "Swim Shorts": pEssentialsShorts,
  },
  accessories: {
    "All accessories": subBags,
    "Sunglasses": subSunglasses,
    "Hats & Caps": pCap,
    "Bags": subBags,
    "Socks, Wallets & Belts": subSocks,
    "Gloves & Scarves": subGloves,
    "Watches": pWatch,
  },
  fragrances: {
    "All fragrances": subFragBest,
    "Perfumes": subFragLuxury,
    "Body Mists": subFragTravel,
    "Deodorants": subFragMen,
    "Gift Sets": subFragNew,
    "Best Sellers": subFragBest,
    "New Arrivals": subFragNew,
  },
};

export function getSubcategoryThumbnail(categoryId: string, subcategory: string) {
  return subcategoryThumbnailOverrides[categoryId]?.[subcategory];
}



export function getCategoryName(categoryId: string) {
  return categories.find((c) => c.id === categoryId)?.name ?? "All Products";
}

export function getProductById(id: string) {
  return (
    shopProducts.find((p) => p.id === id) ??
    bestSellerProducts.find((p) => p.id === id) ??
    trendingProducts.find((p) => p.id === id)
  );
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  const all = getAllProducts();
  const scored = all
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0;
      if (p.category === product.category) score += 3;
      if (p.subcategory && p.subcategory === product.subcategory) score += 2;
      if (p.brand === product.brand) score += 1;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
}

// Concierge / pre-order items: sourced on request rather than stocked.
// Flagged explicitly via `isConcierge`, or implicitly for Pre Order / Limited Pieces availability.
export function isConciergeProduct(product: Product) {
  return (
    product.isConcierge === true ||
    product.availability === "Pre Order" ||
    product.availability === "Limited Pieces"
  );
}

/**
 * Price-on-request pieces in the general store: no public price, sourced
 * and quoted by the concierge team.
 */
export function isPriceOnRequest(product: Product) {
  return product.price <= 0;
}




/* -------------------- Shop-depth helpers -------------------- */

const allCatalog = () => [...shopProducts, ...bestSellerProducts, ...trendingProducts];

/** Unique products across every catalog list, keyed by id. */
export function getAllProducts(): Product[] {
  const seen = new Map<string, Product>();
  for (const p of allCatalog()) if (!seen.has(p.id)) seen.set(p.id, p);
  return [...seen.values()];
}

/** Aggregated brands with their live product counts. */
export function getAllBrands(): { name: string; count: number; sample: Product }[] {
  const grouped = new Map<string, Product[]>();
  for (const p of getAllProducts()) {
    const key = p.brand.trim().toUpperCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }
  return [...grouped.entries()]
    .map(([name, items]) => ({ name, count: items.length, sample: items[0] }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getProductsByBrand(brand: string): Product[] {
  const key = brand.trim().toUpperCase();
  return getAllProducts().filter((p) => p.brand.trim().toUpperCase() === key);
}

/** Newest arrivals - deterministic pick prioritising trending + shop lists. */
export function getNewArrivals(limit = 12): Product[] {
  const source = [...trendingProducts, ...shopProducts];
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const p of source) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

/**
 * Per-size availability from the product API (`sizeAvailability` / `outOfStock`).
 * When API meta is missing (e.g. still hydrating), all listed sizes are treated as available.
 */
export function getSizeAvailability(product: Product): Record<string, boolean> {
  const fromApi = getApiSizeAvailability(product.id);
  if (fromApi) return { ...fromApi };
  const out: Record<string, boolean> = {};
  if ((product.availability as string) === "Out of Stock" || isApiOutOfStock(product.id)) {
    for (const s of product.sizes) out[s] = false;
    return out;
  }
  for (const s of product.sizes) out[s] = true;
  return out;
}

export function isOutOfStock(product: Product) {
  if (isApiOutOfStock(product.id)) return true;
  return (
    (product.availability as string) === "Out of Stock" ||
    (product.sizes.length > 0 && Object.values(getSizeAvailability(product)).every((v) => v === false))
  );
}
