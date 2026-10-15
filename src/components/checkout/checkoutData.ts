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


export const naira = (n: number) => `₦${n.toLocaleString()}`;

export const CHECKOUT_STEPS = [
  { id: 1, label: "Cart", to: "/cart" },
  { id: 2, label: "Information", to: "/checkout/information" },
  { id: 3, label: "Payment", to: "/checkout/payment" },
  { id: 4, label: "Review", to: "/checkout/review" },
] as const;
