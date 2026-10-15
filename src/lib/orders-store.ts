import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, OrderItem } from "@/components/account/ordersData";
import type { CartItem } from "@/lib/cart-store";
import type { CheckoutAddress, CheckoutContact, DeliveryMethod, PaymentMethod } from "@/lib/checkout-store";
import { balanceFor, depositFor, getDropById } from "@/lib/coming-soon";
import { formatCartSize, getProductById, getProductSizeLabel } from "@/lib/shop-data";
import { accountApi, koboToNaira, type ApiOrderCard, type ApiOrderDetail } from "@/lib/api/account";

export type OrderReservation = {
  dropId: string;
  productId: string;
  productName: string;
  image: string;
  size?: string;
  retail: number;
  deposit: number;
  balance: number;
  releaseAt: string;
  reservationApiId?: string;
  depositPct?: number;
  balancePaid: boolean;
  balancePaidAt?: number;
};

export type PlacedOrder = Order & {
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  address: CheckoutAddress | null;
  contact: CheckoutContact | null;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
  placedAt: number;
  reservation?: OrderReservation;
  apiId?: string;
};

type CreateArgs = {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  shipping: number;
  address: CheckoutAddress;
  contact: CheckoutContact;
  delivery: DeliveryMethod;
  payment: PaymentMethod;
};

type State = {
  orders: PlacedOrder[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  hydrateOrder: (id: string) => Promise<PlacedOrder | undefined>;
  createOrder: (args: CreateArgs) => PlacedOrder;
  recordPlacedOrder: (args: CreateArgs & { id: string; total?: number }) => PlacedOrder;
  getById: (id: string) => PlacedOrder | undefined;
  updateStatus: (ids: string[], status: OrderStatus) => void;
  removeOrders: (ids: string[]) => void;
};

function reservationFrom(items: CartItem[]): OrderReservation | undefined {
  const dep = items.find((i) => i.productId.endsWith("-deposit"));
  if (!dep) return undefined;
  const dropId = dep.productId.replace(/-deposit$/, "");
  const drop = getDropById(dropId);
  if (!drop) return undefined;
  const price = drop.product.price;
  return {
    dropId,
    productId: drop.product.id,
    productName: `${drop.product.brand} ${drop.product.name}`,
    image: drop.product.image,
    size: dep.size,
    retail: price,
    deposit: depositFor(price),
    balance: balanceFor(price),
    releaseAt: drop.releaseAt,
    depositPct: drop.depositPct,
    balancePaid: false,
  };
}

function pad(n: number, size = 6) {
  return String(n).padStart(size, "0");
}

function makeId(existing: number) {
  return `ASL-ORD-${pad(20250 + existing)}`;
}

function makeTracking() {
  const n = Math.floor(Math.random() * 9_000_000_000) + 1_000_000_000;
  return `DHL-${n}`;
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function addDays(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeStatus(s: string): OrderStatus {
  const key = s.toLowerCase();
  if (key.includes("ship")) return "Shipped";
  if (key.includes("deliver")) return "Delivered";
  if (key.includes("cancel")) return "Cancelled";
  if (key.includes("return")) return "Returned";
  return "Processing";
}

function mapApiCard(o: ApiOrderCard): PlacedOrder {
  const placed = o.date ? new Date(o.date) : new Date();
  const total = koboToNaira(o.total);
  return {
    id: o.number || o.id,
    apiId: o.id,
    date: fmtDate(placed),
    status: normalizeStatus(o.status),
    paymentStatus: o.paymentStatus,
    canCancel: o.canCancel,
    canPay: o.canPay,
    canReturn: o.canReturn,
    total,
    itemsCount: o.itemsCount,
    eta: o.eta ? fmtDate(new Date(o.eta)) : undefined,
    tracking: o.tracking ?? undefined,
    items: (o.items ?? []).map((i) => ({
      name: i.name,
      brand: i.brand ?? undefined,
      variant: i.variant,
      qty: i.qty,
      price: koboToNaira(i.price),
      image: i.image || "",
    })),
    subtotal: total,
    discount: 0,
    couponCode: null,
    shipping: 0,
    address: null,
    contact: null,
    delivery: "ship",
    payment: "paystack",
    placedAt: placed.getTime(),
  };
}

function mapApiDetail(o: ApiOrderDetail): PlacedOrder {
  const base = mapApiCard(o);
  const addr = o.address;
  const delivery =
    o.delivery === "pickup" || o.delivery === "ship" ? (o.delivery as DeliveryMethod) : base.delivery;
  const payment =
    o.payment === "paystack" || o.payment === "bank" || o.payment === "card" || o.payment === "wallet"
      ? (o.payment as PaymentMethod)
      : base.payment;
  return {
    ...base,
    subtotal: o.subtotal != null ? koboToNaira(o.subtotal) : base.subtotal,
    discount: o.discount != null ? koboToNaira(o.discount) : 0,
    couponCode: o.couponCode ?? null,
    shipping: o.shipping != null ? koboToNaira(o.shipping) : 0,
    delivery,
    payment,
    address: addr
      ? {
          fullName: String(addr.fullName || addr.recipient || ""),
          address: String(addr.line1 || addr.address || ""),
          apartment: String(addr.line2 || addr.apartment || ""),
          city: String(addr.city || ""),
          state: String(addr.state || ""),
          postal: String(addr.postalCode || addr.postal || ""),
          country: String(addr.country || "Nigeria"),
        }
      : null,
    contact: o.contact
      ? {
          email: o.contact.email || "",
          phone: o.contact.phone || "",
          subscribe: !!o.contact.subscribe,
        }
      : null,
    timeline: o.timeline,
    amountPaid: o.amountPaid != null ? koboToNaira(o.amountPaid) : undefined,
    due: o.due != null ? koboToNaira(o.due) : undefined,
    canCancel: o.canCancel ?? base.canCancel,
    canPay: o.canPay ?? base.canPay,
    canReturn: o.canReturn ?? base.canReturn,
    paymentStatus: o.paymentStatus ?? base.paymentStatus,
  };
}

function buildOrder(args: CreateArgs & { id: string; total?: number }): PlacedOrder {
  const { items, subtotal, discount, couponCode, shipping, address, contact, delivery, payment, id } = args;
  const now = new Date();
  const orderItems: OrderItem[] = items.map((i) => {
    const product = i.productId ? getProductById(i.productId) : undefined;
    const sizeLabel = i.size
      ? product
        ? getProductSizeLabel(product, i.size)
        : formatCartSize(i.size)
      : null;
    return {
      name: i.name,
      brand: product?.brand,
      variant: `${i.variant}${sizeLabel ? ` · ${sizeLabel}` : ""}${i.color ? ` · ${i.color}` : ""}`,
      qty: i.qty,
      price: i.price,
      image: i.image,
    };
  });

  const total = args.total ?? subtotal - discount + shipping;
  return {
    id,
    date: fmtDate(now),
    status: "Processing",
    total,
    itemsCount: items.reduce((n, i) => n + i.qty, 0),
    eta: fmtDate(addDays(now, 5)),
    tracking: delivery === "ship" ? makeTracking() : undefined,
    items: orderItems,
    subtotal,
    discount,
    couponCode,
    shipping,
    address,
    contact,
    delivery,
    payment,
    placedAt: now.getTime(),
    reservation: reservationFrom(items),
  };
}

export const useOrders = create<State>()(
  persist(
    (set, get) => ({
      orders: [],
      hydrated: false,
      hydrate: async () => {
        try {
          const rows = await accountApi.myOrders();
          const mapped = rows.map(mapApiCard);
          const localOnly = get().orders.filter(
            (o) => !mapped.some((m) => m.id === o.id || m.apiId === o.apiId)
          );
          set({ orders: [...mapped, ...localOnly], hydrated: true });
        } catch (err) {
          console.warn("[orders] hydrate failed", err);
          set({ hydrated: true });
        }
      },
      hydrateOrder: async (id) => {
        try {
          const detail = await accountApi.myOrder(id);
          const mapped = mapApiDetail(detail);
          set((s) => ({
            orders: [mapped, ...s.orders.filter((o) => o.id !== mapped.id && o.apiId !== mapped.apiId)],
          }));
          return mapped;
        } catch (err) {
          console.warn("[orders] hydrateOrder failed", err);
          return get().getById(id);
        }
      },
      createOrder: (args) => {
        const order = buildOrder({ ...args, id: makeId(get().orders.length + 1) });
        set((s) => ({ orders: [order, ...s.orders] }));
        return order;
      },
      recordPlacedOrder: (args) => {
        const order = buildOrder(args);
        set((s) => ({
          orders: [order, ...s.orders.filter((o) => o.id !== order.id)],
        }));
        return order;
      },
      getById: (id) => get().orders.find((o) => o.id === id || o.apiId === id),
      updateStatus: (ids, status) => {
        const set2 = new Set(ids);
        set((s) => ({
          orders: s.orders.map((o) => (set2.has(o.id) || (o.apiId && set2.has(o.apiId)) ? { ...o, status } : o)),
        }));
      },
      removeOrders: (ids) => {
        const set2 = new Set(ids);
        set((s) => ({ orders: s.orders.filter((o) => !set2.has(o.id)) }));
      },
    }),
    {
      name: "asl-orders",
      version: 2,
      partialize: (s) => ({ orders: s.orders }),
      migrate: () => ({ orders: [] }),
    }
  )
);

export const useOrderById = (id: string | undefined) =>
  useOrders((s) => (id ? s.orders.find((o) => o.id === id || o.apiId === id) : undefined));
export const useAllOrders = () => useOrders((s) => s.orders);
