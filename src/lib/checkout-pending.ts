export type CheckoutPending = {
  orderNumber: string;
  orderId: string;
  accessToken?: string;
  paymentReference?: string;
};

const KEY = "asl-checkout-pending";

export function saveCheckoutPending(pending: CheckoutPending) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(pending));
}

export function readCheckoutPending(): CheckoutPending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CheckoutPending) : null;
  } catch {
    return null;
  }
}

export function clearCheckoutPending() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
