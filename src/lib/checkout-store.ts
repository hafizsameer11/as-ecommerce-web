import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceApi, koboToNaira } from "@/lib/api/commerce";

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
  setContact: (patch: Partial<CheckoutContact>) => void;
  setAddress: (patch: Partial<CheckoutAddress>) => void;
  setDelivery: (m: DeliveryMethod) => void;
  setPayment: (m: PaymentMethod) => void;
  applyCoupon: (code: string) => Promise<{ ok: boolean; pct: number; message: string }>;
  removeCoupon: () => void;
  syncSession: () => Promise<void>;
};

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
      setContact: (patch) => set((s) => ({ contact: { ...s.contact, ...patch } })),
      setAddress: (patch) => set((s) => ({ address: { ...s.address, ...patch } })),
      setDelivery: (m) => set({ delivery: m }),
      setPayment: (m) => set({ payment: m }),
      syncSession: async () => {
        const s = get();
        try {
          const snap = await commerceApi.patchCheckout({
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
          });
          if (snap.totals) {
            const sub = snap.totals.subtotal || 0;
            const disc = snap.totals.discount || 0;
            set({
              discountAmount: koboToNaira(disc),
              shippingAmount: koboToNaira(snap.totals.shipping || 0),
              discountPct: sub > 0 ? Math.round((disc / sub) * 100) : 0,
              coupon: snap.session?.couponCode ?? get().coupon,
            });
          }
        } catch (err) {
          console.warn("[checkout] sync failed", err);
        }
      },
      applyCoupon: async (raw) => {
        const code = raw.trim().toUpperCase();
        if (!code) return { ok: false, pct: 0, message: "Enter a coupon code" };
        try {
          await get().syncSession();
          const res = await commerceApi.applyCoupon(code);
          const disc = res.coupon?.discount ?? res.checkout?.totals?.discount ?? 0;
          const sub = res.checkout?.totals?.subtotal ?? 0;
          const pct = sub > 0 ? Math.round((disc / sub) * 100) : 0;
          set({
            coupon: res.coupon?.code ?? code,
            discountPct: pct,
            discountAmount: koboToNaira(disc),
            shippingAmount: koboToNaira(res.checkout?.totals?.shipping ?? 0),
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

export const SHIP_FEE_BY_STATE: Record<string, number> = {
  Lagos: 4000,
  Abuja: 5000,
  Other: 6000,
};

export function shippingFor(delivery: DeliveryMethod, state: string): number {
  if (delivery === "pickup") return 0;
  const fromApi = useCheckout.getState().shippingAmount;
  if (fromApi > 0) return fromApi;
  if (state.toLowerCase().includes("lagos")) return SHIP_FEE_BY_STATE.Lagos;
  if (state.toLowerCase().includes("abuja") || state.toLowerCase().includes("fct"))
    return SHIP_FEE_BY_STATE.Abuja;
  return SHIP_FEE_BY_STATE.Other;
}
