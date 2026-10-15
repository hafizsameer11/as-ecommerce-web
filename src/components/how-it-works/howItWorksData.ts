import { FileText, Search, ShoppingBag, Tag, ShieldCheck, Truck, Lock, Headphones, Package, RotateCcw } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import catFootwear from "@/assets/cat-footwear.jpg";
import catClothing from "@/assets/cat-clothing.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catBag from "@/assets/hero-bag.jpg";
import catFragrances from "@/assets/cat-fragrances.jpg";
import catLimited from "@/assets/cat-limited.jpg";
import conciergeHero from "@/assets/concierge-hero.jpg";

export const steps = [
  { n: 1, Icon: FileText, title: "SUBMIT YOUR REQUEST", sub: "Fill out the request form with as much detail as possible. Include product name, brand, size, color, link or photo, and your budget." },
  { n: 2, Icon: Search, title: "WE REVIEW YOUR REQUEST", sub: "Our concierge specialists review your request carefully. If we need more information, we'll contact you." },
  { n: 3, Icon: ShoppingBag, title: "WE SOURCE YOUR ITEM", sub: "We search our trusted global network of verified suppliers to find your desired item." },
  { n: 4, Icon: Tag, title: "PRICE CONFIRMATION", sub: "Once we locate your item, we send you the final price, estimated delivery time and payment details." },
  { n: 5, Icon: ShieldCheck, title: "SECURE YOUR ORDER", sub: "After your payment confirmation, we secure your order and keep you updated at every step." },
  { n: 6, Icon: Truck, title: "DELIVERY TO YOU", sub: "Your item is carefully inspected, packed and delivered to your doorstep." },
];

export const trust = [
  { Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", sub: "Every item is 100% authentic and sourced from trusted official suppliers." },
  { Icon: Lock, title: "SECURE PAYMENT", sub: "Your payment is safe with us. Multiple secure payment options available." },
  { Icon: Headphones, title: "DEDICATED SUPPORT", sub: "Our team is here to assist you throughout the entire process." },
  { Icon: Package, title: "SAFE DELIVERY", sub: "Fast and secure delivery to your doorstep with tracking updates." },
  { Icon: RotateCcw, title: "EASY RETURNS", sub: "Return within 7 days of delivery if the item is unused and in original condition." },
];

export const requestCats = [
  { img: catFootwear, label: "SNEAKERS &\nSTREETWEAR" },
  { img: catClothing, label: "LUXURY\nFASHION" },
  { img: catAccessories, label: "WATCHES &\nACCESSORIES" },
  { img: catBag, label: "BAGS &\nLUGGAGE" },
  { img: catFragrances, label: "FRAGRANCES &\nBEAUTY" },
  { img: catLimited, label: "LIMITED EDITION\nDROPS" },
  { img: conciergeHero, label: "CUSTOM\nREQUESTS" },
];
