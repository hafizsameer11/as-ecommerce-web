import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order, OrderStatus, OrderItem } from "@/components/account/ordersData";
import type { CartItem } from "@/lib/cart-store";
import type { CheckoutAddress, CheckoutContact, DeliveryMethod, PaymentMethod } from "@/lib/checkout-store";
import { balanceFor, depositFor, getDropById } from "@/lib/coming-soon";
import { formatCartSize, getProductById, getProductSizeLabel } from "@/lib/shop-data";
import { accountApi, koboToNaira, type ApiOrderCard } from "@/lib/api/account";

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
  createOrder: (args: CreateArgs) => PlacedOrder;
  recordPlacedOrder: (args: CreateArgs & { id: string; total?: number }) => PlacedOrder;
  getById: (id: string) => PlacedOrder | undefined;
  updateStatus: (ids: string[], status: OrderStatus) => void;
  removeOrders: (ids: string[]) => void;
  payBalance: (id: string) => void;
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
      payBalance: (id) =>
        set((s) => ({
          orders: s.orders.map((o) =>
            o.id === id && o.reservation
              ? { ...o, reservation: { ...o.reservation, balancePaid: true, balancePaidAt: Date.now() } }
              : o
          ),
        })),
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
