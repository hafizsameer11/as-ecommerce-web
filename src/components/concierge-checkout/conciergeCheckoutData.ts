export type ConciergeStatus = "Sourcing in Progress" | "Payment Pending" | "Ready to Purchase";

export type ConciergeCartItem = {
  id: string;
  name: string;
  brand: string;
  image: string;
  size?: string;
  condition: string;
  source: string;
  status: ConciergeStatus;
  statusNote: string;
  price: number;
  qty: number;
};

export const conciergeItems: ConciergeCartItem[] = [
  {
    id: "aj1-btr",
    brand: "Jordan",
    name: 'Air Jordan 1 Retro High OG "Black Toe Reimagined"',
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=240&q=80",
    size: "UK 9",
    condition: "New",
    source: "StockX",
    status: "Sourcing in Progress",
    statusNote: "Our concierge team is finding the best option for you.",
    price: 280000,
    qty: 1,
  },
  {
    id: "lv-keepall",
    brand: "Louis Vuitton",
    name: "Keepall Bandoulière 50 Monogram",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=240&q=80",
    condition: "New",
    source: "Official Store",
    status: "Payment Pending",
    statusNote: "Awaiting payment confirmation to purchase.",
    price: 520000,
    qty: 1,
  },
  {
    id: "bal-hoodie",
    brand: "Balenciaga",
    name: "Logo Hoodie",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=240&q=80",
    size: "M",
    condition: "New",
    source: "Farfetch",
    status: "Ready to Purchase",
    statusNote: "Item found. We'll purchase once payment is confirmed.",
    price: 210000,
    qty: 1,
  },
];

export const conciergeStatusStyle: Record<ConciergeStatus, string> = {
  "Sourcing in Progress": "bg-amber-100 text-amber-800",
  "Payment Pending": "bg-orange-100 text-orange-800",
  "Ready to Purchase": "bg-muted text-ink",
};

export const naira = (n: number) => `₦${n.toLocaleString()}`;

export const CONCIERGE_SERVICE_FEE = 50500;
export const CONCIERGE_SHIPPING_EST = 35000;

export const conciergeSubtotal = () =>
  conciergeItems.reduce((s, i) => s + i.price * i.qty, 0);

export const conciergeTotal = () =>
  conciergeSubtotal() + CONCIERGE_SERVICE_FEE + CONCIERGE_SHIPPING_EST;

export const CONCIERGE_STEPS = [
  { id: 1, label: "Shipping", to: "/concierge/payment" },
  { id: 2, label: "Payment", to: "/concierge/payment" },
  { id: 3, label: "Review", to: "/concierge/review" },
] as const;
