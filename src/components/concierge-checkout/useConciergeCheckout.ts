import { useConciergeCart } from "@/lib/concierge-requests";
import { loyaltyApi, koboToNaira, type ApiConciergeRequest } from "@/lib/api/loyalty";
import { commerceApi } from "@/lib/api/commerce";
import { apiBaseUrl } from "@/lib/api/client";

function isPayableItem(i: ApiConciergeRequest) {
  const key = (i.statusKey || "").toLowerCase();
  return (
    Boolean(i.quote) &&
    (key === "quoted" || key === "payment_pending" || key === "approved" || i.cartStatus === "Payment Pending" || i.cartStatus === "Ready to Purchase")
  );
}

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
  requestId?: string;
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
  const items = cart.items ?? [];
  const payable = opts.requestId
    ? items.find((i) => i.id === opts.requestId && isPayableItem(i))
    : items.find(isPayableItem);
  if (!payable) {
    return { ok: false, message: "No payable quote in your concierge cart yet." };
  }

  const dueKobo =
    payable.quote?.amountDue ??
    payable.quote?.deposit ??
    (payable.statusKey === "approved" ? payable.quote?.amountDue : undefined) ??
    payable.price ??
    payable.quote?.total ??
    0;

  const returnUrl =
    opts.returnUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/concierge/success${opts.requestId ? `?requestId=${encodeURIComponent(opts.requestId)}` : ""}`
      : undefined);

  const res =
    payable.statusKey === "approved" && (payable.quote?.amountDue ?? 0) > 0
      ? await loyaltyApi.payConciergeBalance(payable.id, { method: opts.method ?? "card", returnUrl })
      : await loyaltyApi.acceptConciergeQuote(payable.id, {
          address: opts.address,
          method: opts.method ?? "card",
          returnUrl,
        });

  const payment = "payment" in res ? res.payment : null;
  rememberConciergePayment({
    requestId: payable.id,
    number: payable.number,
    reference: payment?.reference,
    total: dueKobo ? koboToNaira(dueKobo) : undefined,
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
