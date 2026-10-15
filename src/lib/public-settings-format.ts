import { koboToNaira } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/auth";

/** Single fallback source when `/store/settings/public` omits a field (matches backend defaults). */
export const PUBLIC_SETTINGS_DEFAULTS = {
  shipping: { freeShippingThreshold: 15_000_000 },
  returns: { windowDays: 7, refundProcessingDays: "5 - 10 working days" },
  drops: { depositPctDefault: 20 },
  wallet: { minTopup: 50_000, minWithdrawal: 100_000 },
  profile: {
    supportPhone: "+234 810 123 4567",
    supportEmail: "support@asloriginals.com",
    whatsapp: "2348101234567",
  },
  deliveryRates: [
    { region: "Lagos", fee: 400_000, eta: "2 - 5 working days" },
    { region: "Abuja", fee: 500_000, eta: "2 - 5 working days" },
    { region: "Other States", fee: 600_000, eta: "2 - 5 working days" },
  ],
} as const;

export type DeliveryRateRow = { label: string; feeNaira: number; eta?: string };

export type StoreProfileContact = {
  supportPhone: string;
  supportEmail: string;
  whatsapp: string;
  whatsappUrl: string;
  telUrl: string;
  mailtoUrl: string;
};

function section<T extends Record<string, unknown>>(settings: PublicSettings | null | undefined, key: string): T | undefined {
  const block = settings?.[key];
  return block && typeof block === "object" ? (block as T) : undefined;
}

function deliveryRatesRaw(settings: PublicSettings | null | undefined): unknown[] {
  const block = settings?.deliveryRates;
  if (Array.isArray(block)) return block;
  const nested = section<{ rates?: unknown[] }>(settings, "deliveryRates")?.rates;
  if (Array.isArray(nested)) return nested;
  return [...PUBLIC_SETTINGS_DEFAULTS.deliveryRates];
}

export function freeShippingThresholdNaira(settings: PublicSettings | null | undefined): number {
  const raw =
    section<{ freeShippingThreshold?: number }>(settings, "shipping")?.freeShippingThreshold ??
    PUBLIC_SETTINGS_DEFAULTS.shipping.freeShippingThreshold;
  return koboToNaira(raw);
}

export function returnWindowDays(settings: PublicSettings | null | undefined): number {
  const days =
    section<{ windowDays?: number }>(settings, "returns")?.windowDays ?? PUBLIC_SETTINGS_DEFAULTS.returns.windowDays;
  return days;
}

export function refundProcessingLabel(settings: PublicSettings | null | undefined): string {
  const label = section<{ refundProcessingDays?: string }>(settings, "returns")?.refundProcessingDays;
  return label ?? PUBLIC_SETTINGS_DEFAULTS.returns.refundProcessingDays;
}

export function defaultDepositPct(settings: PublicSettings | null | undefined): number {
  const pct =
    section<{ depositPctDefault?: number }>(settings, "drops")?.depositPctDefault ??
    PUBLIC_SETTINGS_DEFAULTS.drops.depositPctDefault;
  return pct;
}

export function walletMinTopupNaira(settings: PublicSettings | null | undefined): number {
  const kobo =
    section<{ minTopup?: number }>(settings, "wallet")?.minTopup ?? PUBLIC_SETTINGS_DEFAULTS.wallet.minTopup;
  return koboToNaira(kobo);
}

export function walletMinWithdrawNaira(settings: PublicSettings | null | undefined): number {
  const kobo =
    section<{ minWithdrawal?: number }>(settings, "wallet")?.minWithdrawal ??
    PUBLIC_SETTINGS_DEFAULTS.wallet.minWithdrawal;
  return koboToNaira(kobo);
}

export function deliveryRatesNaira(settings: PublicSettings | null | undefined): DeliveryRateRow[] {
  return deliveryRatesRaw(settings).map((row) => {
    const r = row as Record<string, unknown>;
    const label = String(r.region ?? r.label ?? r.name ?? "Delivery");
    const feeRaw = r.fee ?? r.amount ?? r.price ?? 0;
    const feeNaira = koboToNaira(Number(feeRaw));
    const eta = r.eta != null ? String(r.eta) : r.deliveryTime != null ? String(r.deliveryTime) : undefined;
    return { label, feeNaira, eta };
  });
}

export function deliveryEtaSummary(settings: PublicSettings | null | undefined): string {
  const rates = deliveryRatesNaira(settings);
  const eta = rates.find((r) => r.eta)?.eta;
  return eta ?? "2 - 5 working days";
}

export function storeProfileContact(settings: PublicSettings | null | undefined): StoreProfileContact {
  const p = section<Record<string, string>>(settings, "profile") ?? {};
  const supportPhone = p.supportPhone ?? PUBLIC_SETTINGS_DEFAULTS.profile.supportPhone;
  const supportEmail = p.supportEmail ?? PUBLIC_SETTINGS_DEFAULTS.profile.supportEmail;
  const whatsapp = p.whatsapp ?? PUBLIC_SETTINGS_DEFAULTS.profile.whatsapp;
  const waDigits = whatsapp.replace(/\D/g, "");
  const telDigits = supportPhone.replace(/\D/g, "");
  return {
    supportPhone,
    supportEmail,
    whatsapp,
    whatsappUrl: `https://wa.me/${waDigits}`,
    telUrl: telDigits ? `tel:+${telDigits}` : `tel:${supportPhone}`,
    mailtoUrl: `mailto:${supportEmail}`,
  };
}

export function formatPaymentStatusLabel(paymentStatus?: string | null, orderStatus?: string): string {
  const ps = (paymentStatus || "").trim().toLowerCase();
  if (ps === "paid" || ps === "success" || ps === "completed") return "Paid";
  if (ps.includes("partial")) return "Partially paid";
  if (ps.includes("pending") || ps === "awaiting_payment" || ps === "unpaid") return "Awaiting payment";
  if (ps === "failed") return "Payment failed";
  if (ps.includes("refund")) return "Refunded";
  if (paymentStatus) return paymentStatus;
  if ((orderStatus || "").toLowerCase().includes("cancel")) return "Refunded";
  return "Paid";
}
