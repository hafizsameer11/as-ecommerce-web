import sneakers from "@/assets/p-nike-dunk.png";
import luxury from "@/assets/p-aape-jacket.png";
import watches from "@/assets/p-watch.png";
import bags from "@/assets/hero-bag.jpg";
import eyewear from "@/assets/cat-eyewear.jpg";
import caps from "@/assets/p-amiri-cap.png";
import fragrance from "@/assets/p-fragrance.png";
import tech from "@/assets/cat-tech.jpg";
import toys from "@/assets/cat-toys.jpg";
import limited from "@/assets/cat-limited.jpg";
import accessories from "@/assets/cat-accessories.jpg";

export type ConciergeCategory = {
  id: string;
  title: string;
  desc: string;
  img?: string;
  starIcon?: boolean;
};

export const conciergeCategories: ConciergeCategory[] = [
  { id: "sneakers", title: "Sneakers & Streetwear", desc: "Exclusive sneakers, streetwear brands, and limited releases.", img: sneakers },
  { id: "luxury", title: "Luxury Fashion", desc: "Designer clothing, outerwear, and high-end collections.", img: luxury },
  { id: "watches", title: "Watches & Accessories", desc: "Luxury watches, straps, jewelry & premium accessories.", img: watches },
  { id: "bags", title: "Bags & Luggage", desc: "Luxury bags, backpacks, travel luggage & more.", img: bags },
  { id: "eyewear", title: "Eyewear", desc: "Designer sunglasses and optical frames.", img: eyewear },
  { id: "caps", title: "Hats & Caps", desc: "Exclusive hats, caps, beanies and headwear.", img: caps },
  { id: "fragrance", title: "Fragrance & Beauty", desc: "Luxury perfumes, skincare and beauty products.", img: fragrance },
  { id: "tech", title: "Tech & Gadgets", desc: "Premium tech, audio, gadgets and smart accessories.", img: tech },
  { id: "toys", title: "Collectibles & Toys", desc: "Designer toys, art pieces & limited collectibles.", img: toys },
  { id: "limited", title: "Limited Edition Drops", desc: "Limited drops, collabs and exclusive releases.", img: limited },
  { id: "accessories", title: "Accessories", desc: "Belts, wallets, jewelry, ties and small accessories.", img: accessories },
  { id: "custom", title: "Custom Requests", desc: "Can't find the category? Tell us what you need.", starIcon: true },
];
