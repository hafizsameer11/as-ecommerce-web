import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceApi, koboToNaira, type CheckoutSnapshot } from "@/lib/api/commerce";

export type DeliveryMethod = "ship" | "pickup";
export type PaymentMethod = "paystack" | "bank" | "card";

export type CheckoutAddress = {
  fullName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

export type CheckoutContact = {
  email: string;
  phone: string;
  subscribe: boolean;
};

type CheckoutState = {
  contact: CheckoutContact;
  address: CheckoutAddress;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  coupon: string | null;
  discountPct: number;
  discountAmount: number;
  shippingAmount: number;
  subtotalAmount: number;
  totalAmount: number;
  shippingRateId: string | null;
  pickupLocationId: string | null;
  shippingOptions: unknown[];
  pickupLocations: unknown[];
  placeOrderIdempotencyKey: string | null;
  setContact: (patch: Partial<CheckoutContact>) => void;
  setAddress: (patch: Partial<CheckoutAddress>) => void;
  setDelivery: (m: DeliveryMethod) => void;
  setPayment: (m: PaymentMethod) => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; pct: number; message: string }>;
  removeCoupon: () => void;
  syncSession: () => Promise<void>;
  getPlaceOrderIdempotencyKey: () => string;
  clearPlaceOrderIdempotencyKey: () => void;
};

function firstOptionId(list: unknown[] | undefined): string | null {
  const row = list?.[0] as { id?: string } | undefined;
  return row?.id ?? null;
}

function applySnapshot(
  set: (partial: Partial<CheckoutState>) => void,
  get: () => CheckoutState,
  snap: CheckoutSnapshot
) {
  const patch: Partial<CheckoutState> = {
    shippingOptions: snap.shippingOptions ?? get().shippingOptions,
    pickupLocations: snap.pickupLocations ?? get().pickupLocations,
  };
  if (snap.session?.pickupLocationId) patch.pickupLocationId = snap.session.pickupLocationId;
  if (snap.session?.shippingRateId) patch.shippingRateId = snap.session.shippingRateId;
  if (snap.session?.couponCode !== undefined) {
    patch.coupon = snap.session.couponCode ?? null;
  }
  if (snap.totals) {
    const sub = snap.totals.subtotal || 0;
    const disc = snap.totals.discount || 0;
    patch.discountAmount = koboToNaira(disc);
    patch.shippingAmount = koboToNaira(snap.totals.shipping ?? 0);
    patch.subtotalAmount = koboToNaira(sub);
    patch.totalAmount = koboToNaira(snap.totals.total ?? 0);
    patch.discountPct = sub > 0 ? Math.round((disc / sub) * 100) : 0;
  }
  set(patch);
}

const initialContact: CheckoutContact = {
  email: "",
  phone: "",
  subscribe: false,
};

const initialAddress: CheckoutAddress = {
  fullName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postal: "",
  country: "Nigeria",
};

function mapPayment(m: PaymentMethod): string {
  if (m === "card") return "card";
  if (m === "bank") return "bank";
  return "paystack";
}

export const useCheckout = create<CheckoutState>()(
  persist(
    (set, get) => ({
      contact: initialContact,
      address: initialAddress,
      delivery: "ship",
      payment: "paystack",
      coupon: null,
      discountPct: 0,
      discountAmount: 0,
      shippingAmount: 0,
      subtotalAmount: 0,
      totalAmount: 0,
      shippingRateId: null,
      pickupLocationId: null,
      shippingOptions: [],
      pickupLocations: [],
      placeOrderIdempotencyKey: null,
      setContact: (patch) => set((s) => ({ contact: { ...s.contact, ...patch } })),
      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),
      setDelivery: (m) => set({ delivery: m }),
      setPayment: (m) => set({ payment: m }),
      syncSession: async () => {
        const s = get();
        try {
          let snap = await commerceApi.getCheckout();
          applySnapshot(set, get, snap);

          let pickupLocationId =
            s.pickupLocationId ?? snap.session?.pickupLocationId ?? firstOptionId(snap.pickupLocations);
          let shippingRateId =
            s.shippingRateId ?? snap.session?.shippingRateId ?? firstOptionId(snap.shippingOptions);

          if (s.delivery === "pickup" && !pickupLocationId) {
            pickupLocationId = firstOptionId(get().pickupLocations);
          }
          if (s.delivery === "ship" && !shippingRateId) {
            shippingRateId = firstOptionId(get().shippingOptions);
          }

          snap = await commerceApi.patchCheckout({
            contact: {
              email: s.contact.email,
              phone: s.contact.phone || undefined,
              subscribe: s.contact.subscribe,
            },
            delivery: s.delivery,
            address:
              s.delivery === "ship"
                ? {
                    fullName: s.address.fullName,
                    address: s.address.address,
                    apartment: s.address.apartment || undefined,
                    city: s.address.city,
                    state: s.address.state,
                    postal: s.address.postal || undefined,
                    country: s.address.country || "NG",
                    phone: s.contact.phone || undefined,
                  }
                : undefined,
            paymentMethod: mapPayment(s.payment),
            pickupLocationId: s.delivery === "pickup" ? pickupLocationId : null,
            shippingRateId: s.delivery === "ship" ? shippingRateId : null,
          });
          applySnapshot(set, get, snap);
          if (pickupLocationId) set({ pickupLocationId });
          if (shippingRateId) set({ shippingRateId });
        } catch (err) {
          console.warn("[checkout] sync failed", err);
        }
      },
      getPlaceOrderIdempotencyKey: () => {
        const existing = get().placeOrderIdempotencyKey;
        if (existing) return existing;
        const key = `po_${crypto.randomUUID()}`;
        set({ placeOrderIdempotencyKey: key });
        return key;
      },
      clearPlaceOrderIdempotencyKey: () => set({ placeOrderIdempotencyKey: null }),
      applyCoupon: async (raw) => {
        const code = raw.trim().toUpperCase();
        if (!code) return { ok: false, pct: 0, message: "Enter a coupon code" };
        try {
          await get().syncSession();
          const res = await commerceApi.applyCoupon(code);
          const disc = res.coupon?.discount ?? res.checkout?.totals?.discount ?? 0;
          const sub = res.checkout?.totals?.subtotal ?? 0;
          const pct = sub > 0 ? Math.round((disc / sub) * 100) : 0;
          if (res.checkout) applySnapshot(set, get, res.checkout);
          set({
            coupon: res.coupon?.code ?? code,
            discountPct: pct,
            discountAmount: koboToNaira(disc),
          });
          return { ok: true, pct, message: res.message || `${pct}% off applied` };
        } catch (err) {
          set({ coupon: null, discountPct: 0, discountAmount: 0 });
          return {
            ok: false,
            pct: 0,
            message: err instanceof Error ? err.message : "Invalid coupon code",
          };
        }
      },
      removeCoupon: () => {
        set({ coupon: null, discountPct: 0, discountAmount: 0 });
        void commerceApi.removeCoupon().catch(() => undefined);
      },
    }),
    { name: "asl-checkout" }
  )
);

/** Server checkout shipping (kobo→naira). Pickup is always 0. */
export function shippingFor(delivery: DeliveryMethod, _state?: string): number {
  if (delivery === "pickup") return 0;
  return useCheckout.getState().shippingAmount;
}

export function checkoutTotalFallback(subtotal: number, discount: number, shipping: number): number {
  const fromApi = useCheckout.getState().totalAmount;
  if (fromApi > 0) return fromApi;
  return subtotal - discount + shipping;
}
