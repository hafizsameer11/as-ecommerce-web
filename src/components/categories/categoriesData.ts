import catSneakers from "@/assets/p-nike-dunk.png";
import catLuxury from "@/assets/p-aape-jacket.png";
import catWatch from "@/assets/p-watch.png";
import catBag from "@/assets/hero-bag.jpg";
import catEyewear from "@/assets/cat-eyewear.jpg";
import catCap from "@/assets/p-amiri-cap.png";
import catTech from "@/assets/cat-tech.jpg";
import catToys from "@/assets/cat-toys.jpg";
import catFragrance from "@/assets/p-fragrance.png";
import catHome from "@/assets/cat-home.jpg";
import catLimited from "@/assets/cat-limited.jpg";

export const conciergeCategories = [
  { id: "sneakers", name: "Sneakers & Streetwear", desc: "Exclusive sneakers, streetwear brands, and limited releases.", img: catSneakers },
  { id: "luxury", name: "Luxury Fashion", desc: "Designer clothing, outerwear, and high-end collections.", img: catLuxury },
  { id: "watches", name: "Watches & Accessories", desc: "Luxury watches, straps, jewelry & premium accessories.", img: catWatch },
  { id: "bags", name: "Bags & Luggage", desc: "Luxury bags, backpacks, travel luggage & more.", img: catBag },
  { id: "eyewear", name: "Eyewear", desc: "Designer sunglasses and optical frames.", img: catEyewear },
  { id: "hats", name: "Hats & Caps", desc: "Exclusive hats, caps, beanies and headwear.", img: catCap },
  { id: "tech", name: "Tech & Gadgets", desc: "Premium tech, audio, gadgets and smart accessories.", img: catTech },
  { id: "toys", name: "Collectibles & Toys", desc: "Designer toys, art pieces & limited collectibles.", img: catToys },
  { id: "fragrance", name: "Fragrance & Beauty", desc: "Luxury perfumes, skincare and beauty products.", img: catFragrance },
  { id: "home", name: "Home & Lifestyle", desc: "Luxury home decor, furniture and lifestyle products.", img: catHome },
  { id: "limited", name: "Limited Edition Drops", desc: "Limited drops, collabs and exclusive releases.", img: catLimited },
  { id: "custom", name: "Custom Requests", desc: "Can't find the category? Tell us what you need.", img: null, isCustom: true },
];
