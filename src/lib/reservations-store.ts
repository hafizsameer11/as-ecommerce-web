import { create } from "zustand";
import { loyaltyApi, koboToNaira, type ApiReservation } from "@/lib/api/loyalty";

export type Reservation = {
  id: string;
  apiId: string;
  number: string;
  dropId: string;
  productId: string;
  productName: string;
  brand: string;
  image: string;
  size?: string;
  price: number;
  deposit: number;
  balance: number;
  releaseAt: string;
  createdAt: number;
  status: "Reserved" | "Cancelled" | "Pending";
  canCancel?: boolean;
};

function mapReservation(r: ApiReservation): Reservation {
  const statusRaw = (r.status || "").toLowerCase();
  let status: Reservation["status"] = "Reserved";
  if (statusRaw.includes("cancel")) status = "Cancelled";
  else if (statusRaw.includes("pending")) status = "Pending";
  return {
    id: r.number || r.id,
    apiId: r.id,
    number: r.number,
    dropId: r.drop.id,
    productId: r.product.id,
    productName: r.product.name,
    brand: r.product.brand,
    image: r.product.image || "/favicon.png",
    size: r.size ?? undefined,
    price: koboToNaira(r.price),
    deposit: koboToNaira(r.deposit),
    balance: koboToNaira(r.balance),
    releaseAt: typeof r.drop.releaseAt === "string" ? r.drop.releaseAt : new Date(r.drop.releaseAt).toISOString(),
    createdAt: new Date(r.createdAt).getTime(),
    status,
    canCancel: r.canCancel,
  };
}

type ReservationsState = {
  items: Reservation[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  reserve: (input: {
    dropId: string;
    productId: string;
    productName: string;
    brand: string;
    image: string;
    size?: string;
    color?: string;
    price: number;
    deposit: number;
    balance: number;
    releaseAt: string;
  }) => Promise<{ reservation: Reservation; paymentUrl: string | null }>;
  cancel: (id: string) => Promise<void>;
  hasDrop: (dropId: string) => boolean;
};

export const useReservations = create<ReservationsState>()((set, get) => ({
  items: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const rows = await loyaltyApi.myReservations();
      set({ items: rows.map(mapReservation), hydrated: true });
    } catch (err) {
      console.warn("[reservations] hydrate failed", err);
      set({ hydrated: true });
    }
  },
  reserve: async (input) => {
    const res = await loyaltyApi.reserveDrop(input.dropId, { size: input.size, color: input.color });
    const reservation = mapReservation(res.reservation);
    set((s) => ({
      items: [reservation, ...s.items.filter((i) => i.dropId !== input.dropId || i.status === "Cancelled")],
    }));
    return {
      reservation,
      paymentUrl: res.payment?.authorizationUrl ?? null,
    };
  },
  cancel: async (id) => {
    const row = get().items.find((i) => i.id === id || i.apiId === id || i.number === id);
    const apiId = row?.apiId ?? id;
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id || i.apiId === id || i.number === id ? { ...i, status: "Cancelled" as const } : i
      ),
    }));
    try {
      await loyaltyApi.cancelReservation(apiId);
    } catch (err) {
      console.warn("[reservations] cancel sync", err);
      await get().hydrate();
    }
  },
  hasDrop: (dropId) =>
    get().items.some((i) => i.dropId === dropId && (i.status === "Reserved" || i.status === "Pending")),
}));

export const useActiveReservations = () =>
  useReservations((s) => s.items.filter((i) => i.status === "Reserved" || i.status === "Pending"));
