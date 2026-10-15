import { CreditCard, Wallet, Building2, Smartphone, type LucideIcon } from "lucide-react";

export type Card = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expMonth: string;
  expYear: string;
  isDefault?: boolean;
  nickname?: string | null;
};

export type OtherMethod = {
  id: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
};

export const otherMethods: OtherMethod[] = [
  { id: "wallet", label: "ASL Wallet", desc: "Pay with your wallet balance", Icon: Wallet },
  { id: "transfer", label: "Bank Transfer", desc: "Pay via direct bank transfer", Icon: Building2 },
  { id: "ussd", label: "USSD / Mobile", desc: "Pay with USSD on any device", Icon: Smartphone },
  { id: "new-card", label: "Add New Card", desc: "Add a new credit or debit card", Icon: CreditCard },
];

export function brandLabel(brand?: string | null) {
  if (!brand) return "Card";
  const b = brand.toLowerCase();
  if (b.includes("visa")) return "Visa";
  if (b.includes("master")) return "Mastercard";
  if (b.includes("verve")) return "Verve";
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

export function mapPaymentMethod(m: {
  id: string;
  brand: string;
  last4: string;
  expMonth?: number | null;
  expYear?: number | null;
  holderName?: string | null;
  nickname?: string | null;
  isDefault?: boolean;
}): Card {
  return {
    id: m.id,
    brand: brandLabel(m.brand),
    last4: m.last4,
    holder: m.holderName || m.nickname || "Card holder",
    expMonth: m.expMonth != null ? String(m.expMonth).padStart(2, "0") : "--",
    expYear: m.expYear != null ? String(m.expYear).slice(-2) : "--",
    isDefault: !!m.isDefault,
    nickname: m.nickname,
  };
}
