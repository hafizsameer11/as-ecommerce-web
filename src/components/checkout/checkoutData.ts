export type CartLine = {
  id: string;
  productId?: string;
  name: string;
  variant: string;
  color?: string;
  size?: string;
  qty: number;
  price: number;
  image: string;
};


export const cartLines: CartLine[] = [
  {
    id: "af1",
    name: "Nike Air Force 1 Low QS",
    variant: "'Mystic Navy'",
    size: "UK 9",
    qty: 1,
    price: 265000,
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "roc",
    name: "Represent Owners Club",
    variant: "T-Shirt Black",
    size: "M",
    qty: 1,
    price: 85000,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "9f",
    name: "New Era 9FORTY",
    variant: "A-Frame Black",
    size: "One Size",
    qty: 1,
    price: 35000,
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=200&q=80",
  },
];

export const naira = (n: number) => `₦${n.toLocaleString()}`;

export const CHECKOUT_STEPS = [
  { id: 1, label: "Cart", to: "/cart" },
  { id: 2, label: "Information", to: "/checkout/information" },
  { id: 3, label: "Payment", to: "/checkout/payment" },
  { id: 4, label: "Review", to: "/checkout/review" },
] as const;
