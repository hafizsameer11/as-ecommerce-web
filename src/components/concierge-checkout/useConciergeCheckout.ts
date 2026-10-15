import { useConciergeCart } from "@/lib/concierge-requests";
import { loyaltyApi } from "@/lib/api/loyalty";
import { commerceApi } from "@/lib/api/commerce";
import { apiBaseUrl } from "@/lib/api/client";

const LAST_PAY_KEY = "asl-concierge-last-pay";

export function useConciergeCheckoutState() {
  return useConciergeCart();
}

export function rememberConciergePayment(payload: {
  requestId: string;
  number?: string;
  reference?: string;
  total?: number;
}) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_PAY_KEY, JSON.stringify({ ...payload, at: Date.now() }));
}

export function readConciergePayment(): {
  requestId: string;
  number?: string;
  reference?: string;
  total?: number;
  at?: number;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_PAY_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Accept the first payable quote in cart and open MockPaymentProvider authorizationUrl. */
export async function payConciergeCart(opts: {
  address: {
    fullName: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    postal?: string;
    country?: string;
  };
  method?: "card" | "bank_transfer";
  returnUrl?: string;
}): Promise<{ ok: boolean; message?: string }> {
  const cart = await loyaltyApi.conciergeCart();
  const payable = (cart.items ?? []).find((i) => {
    const key = (i.statusKey || "").toLowerCase();
    return Boolean(i.quote) && (key === "quoted" || key === "payment_pending" || i.cartStatus === "Payment Pending" || i.cartStatus === "Ready to Purchase");
  });
  if (!payable) {
    return { ok: false, message: "No payable quote in your concierge cart yet." };
  }

  const returnUrl =
    opts.returnUrl ||
    (typeof window !== "undefined" ? `${window.location.origin}/concierge/success` : undefined);

  const res = await loyaltyApi.acceptConciergeQuote(payable.id, {
    address: opts.address,
    method: opts.method ?? "card",
    returnUrl,
  });

  const payment = res.payment;
  rememberConciergePayment({
    requestId: payable.id,
    number: payable.number,
    reference: payment?.reference,
    total: payable.quote?.total ?? payable.price ?? undefined,
  });

  if (payment?.authorizationUrl) {
    const payUrl = payment.authorizationUrl.startsWith("http")
      ? payment.authorizationUrl
      : `${apiBaseUrl()}${payment.authorizationUrl}`;
    window.location.href = payUrl;
    return { ok: true, message: "redirect" };
  }

  if (payment?.reference) {
    await commerceApi.verifyPayment(payment.reference);
  }

  return { ok: true, message: "paid" };
}

export async function verifyConciergeReturn(reference?: string | null) {
  const remembered = readConciergePayment();
  const ref = reference || remembered?.reference;
  if (!ref) return null;
  try {
    return await commerceApi.verifyPayment(ref);
  } catch (err) {
    console.warn("[concierge] verify", err);
    return null;
  }
}
