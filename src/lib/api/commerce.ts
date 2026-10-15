import { apiRequest, koboToNaira, nairaToKobo } from "./client";
import type { CartItem } from "@/lib/cart-store";

export type ApiCartItem = {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  variant?: string | null;
  size?: string | null;
  color?: string | null;
  qty: number;
  price: number;
  lineTotal?: number;
  image?: string | null;
  available?: boolean;
  issue?: string | null;
};

export type ApiCartView = {
  id: string;
  guestToken?: string | null;
  items: ApiCartItem[];
  count: number;
  subtotal: number;
  hasIssues?: boolean;
  freeShipping?: { threshold: number; remaining: number; qualified: boolean };
};

export type CheckoutSnapshot = {
  empty: boolean;
  cart: ApiCartView;
  session?: {
    contact?: { email?: string; phone?: string; subscribe?: boolean } | null;
    delivery?: "ship" | "pickup" | null;
    address?: Record<string, string> | null;
    pickupLocationId?: string | null;
    shippingRateId?: string | null;
    paymentMethod?: string | null;
    couponCode?: string | null;
    useWallet?: boolean;
    giftMessage?: string | null;
  };
  totals?: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    due: number;
    coupons?: { code: string; title?: string; discount: number }[];
    couponError?: string | null;
  };
  shippingOptions?: unknown[];
  pickupLocations?: unknown[];
  rules?: { guestCheckout?: boolean };
};

export type PlaceOrderResult = {
  order: { id: string; number: string; total: number; accessToken?: string; status: string };
  payment: {
    reference: string;
    amount: number;
    status: string;
    authorizationUrl?: string | null;
    accessCode?: string | null;
    provider?: string;
    publicKey?: string | null;
  } | null;
};

const GUEST_TOKEN_KEY = "asl-cart-guest-token";
const ANON_ID_KEY = "asl-anon-id";

export function getGuestToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_TOKEN_KEY);
}

export function setGuestToken(token: string | null | undefined) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(GUEST_TOKEN_KEY);
  else localStorage.setItem(GUEST_TOKEN_KEY, token);
}

export function getAnonId() {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = `anon_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

function cartHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = { ...(extra ?? {}) };
  const token = getGuestToken();
  if (token) headers["X-Cart-Token"] = token;
  headers["X-Client"] = "web";
  headers["X-Anon-Id"] = getAnonId();
  return headers;
}

function rememberGuest(cart: ApiCartView) {
  if (cart.guestToken) setGuestToken(cart.guestToken);
  return cart;
}

export function mapCartViewToItems(cart: ApiCartView): CartItem[] {
  return (cart.items ?? []).map((it) => ({
    id: it.id,
    productId: it.productId,
    name: it.name,
    variant: it.variant || [it.size, it.color].filter(Boolean).join(" / ") || "Default",
    size: it.size ?? undefined,
    color: it.color ?? undefined,
    qty: it.qty,
    price: koboToNaira(it.price),
    image: it.image || "/favicon.png",
  }));
}

export const commerceApi = {
  getCart: async () => rememberGuest(await apiRequest<ApiCartView>("/store/cart", { headers: cartHeaders() })),

  addItem: async (body: { productId: string; size?: string; color?: string; qty?: number }) =>
    rememberGuest(
      await apiRequest<ApiCartView>("/store/cart/items", {
        method: "POST",
        body,
        headers: cartHeaders(),
      })
    ),

  updateItem: async (id: string, body: { qty?: number; size?: string; color?: string }) =>
    rememberGuest(
      await apiRequest<ApiCartView>(`/store/cart/items/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body,
        headers: cartHeaders(),
      })
    ),

  removeItem: async (id: string) =>
    rememberGuest(
      await apiRequest<ApiCartView>(`/store/cart/items/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: cartHeaders(),
      })
    ),

  clearCart: async () =>
    rememberGuest(await apiRequest<ApiCartView>("/store/cart", { method: "DELETE", headers: cartHeaders() })),

  mergeCart: async (guestToken: string) =>
    rememberGuest(
      await apiRequest<ApiCartView>("/store/cart/merge", {
        method: "POST",
        body: { guestToken },
        headers: cartHeaders(),
      })
    ),

  getCheckout: async () =>
    apiRequest<CheckoutSnapshot>("/store/checkout", { headers: cartHeaders() }),

  patchCheckout: async (body: Record<string, unknown>) =>
    apiRequest<CheckoutSnapshot>("/store/checkout", {
      method: "PATCH",
      body,
      headers: cartHeaders(),
    }),

  applyCoupon: async (code: string) =>
    apiRequest<{ message: string; coupon: { code: string; title?: string; discount: number }; checkout: CheckoutSnapshot }>(
      "/store/checkout/coupon",
      { method: "POST", body: { code }, headers: cartHeaders() }
    ),

  removeCoupon: async () =>
    apiRequest<CheckoutSnapshot>("/store/checkout/coupon", {
      method: "DELETE",
      headers: cartHeaders(),
    }),

  placeOrder: async (body: { returnUrl?: string; expectedTotal?: number; idempotencyKey?: string } = {}) => {
    const { idempotencyKey, ...payload } = body;
    const key = idempotencyKey ?? `po_${crypto.randomUUID()}`;
    return apiRequest<PlaceOrderResult>("/store/checkout/place-order", {
      method: "POST",
      body: payload,
      headers: cartHeaders(),
      idempotencyKey: key,
    });
  },

  verifyPayment: async (reference: string) =>
    apiRequest<{
      reference: string;
      status: string;
      amount: number;
      order: { id: string; number: string } | null;
    }>(`/store/payments/${encodeURIComponent(reference)}/verify`, {
      method: "POST",
      headers: cartHeaders(),
    }),

  wishlist: () =>
    apiRequest<{ items: unknown[]; count: number; onSaleCount?: number }>("/store/wishlist"),

  wishlistIds: () => apiRequest<string[]>("/store/wishlist/ids"),

  toggleWishlist: (productId: string, variation?: { size?: string; color?: string }) =>
    apiRequest<{ saved: boolean }>("/store/wishlist", {
      method: "POST",
      body: { productId, size: variation?.size, color: variation?.color },
    }),

  removeWishlist: (productId: string) =>
    apiRequest<{ saved: boolean }>(`/store/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" }),

  mergeWishlist: (items: { productId: string; size?: string; color?: string }[]) =>
    apiRequest<{ items: unknown[]; count: number }>("/store/wishlist/merge", {
      method: "POST",
      body: { items },
    }),

  myCoupons: () =>
    apiRequest<Array<{ code: string; label: string; type: string; value: number; pct: number; source?: string; expiresAt?: string }>>(
      "/store/me/coupons"
    ),
};

export { nairaToKobo, koboToNaira };
