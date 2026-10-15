import heroSneakers from "@/assets/hero-sneakers.jpg";
import heroBag from "@/assets/hero-bag.jpg";
import heroWatch from "@/assets/hero-watch.jpg";
import catClothing from "@/assets/cat-clothing.jpg";
import catFootwear from "@/assets/cat-footwear.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catFragrances from "@/assets/cat-fragrances.jpg";
import concierge from "@/assets/concierge.jpg";

/** Filled from GET /store/home via catalog-hydrate. */
export const heroSlides: {
  id: number;
  tag: string;
  title: string;
  copy: string;
  image: string;
}[] = [];

/** Filled from GET /store/home via catalog-hydrate. */
export const categories: { id: string; name: string; image: string }[] = [
  { id: "clothing", name: "Clothing", image: catClothing },
  { id: "footwear", name: "Footwear", image: catFootwear },
  { id: "accessories", name: "Accessories", image: catAccessories },
  { id: "fragrances", name: "Fragrances", image: catFragrances },
];

/** Home teaser rows — populated from API home payload. */
export const bestSellers: { id: string; brand: string; name: string; price: number; image: string }[] = [];

export const newArrivals: { id: string; brand: string; name: string; price: number; image: string }[] = [];

export const conciergeImage = concierge;

export const formatNaira = (n: number) =>
  "₦" + new Intl.NumberFormat("en-NG").format(n);

export type Product = (typeof bestSellers)[number];
