import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceApi, mapCartViewToItems, getGuestToken, setGuestToken } from "@/lib/api/commerce";

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  variant: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  guestToken: string | null;
  busy: boolean;
  add: (item: Omit<CartItem, "id" | "qty"> & { qty?: number }) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  refresh: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
};

function applyCart(set: (p: Partial<CartState>) => void, cart: Awaited<ReturnType<typeof commerceApi.getCart>>) {
  if (cart.guestToken) setGuestToken(cart.guestToken);
  set({
    items: mapCartViewToItems(cart),
    guestToken: cart.guestToken ?? getGuestToken(),
    busy: false,
  });
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      guestToken: null,
      busy: false,
      refresh: async () => {
        try {
          set({ busy: true });
          const cart = await commerceApi.getCart();
          applyCart(set, cart);
        } catch (err) {
          console.warn("[cart] refresh failed", err);
          set({ busy: false });
        }
      },
      mergeGuestCart: async () => {
        const token = get().guestToken || getGuestToken();
        if (!token) {
          await get().refresh();
          return;
        }
        try {
          set({ busy: true });
          const cart = await commerceApi.mergeCart(token);
          setGuestToken(null);
          applyCart(set, { ...cart, guestToken: null });
        } catch (err) {
          console.warn("[cart] merge failed", err);
          await get().refresh();
        }
      },
      add: (item) => {
        const qty = item.qty ?? 1;
        // Optimistic local merge for snappy UI
        const key = `${item.productId}-${item.size ?? ""}-${item.color ?? ""}`;
        set((s) => {
          const existing = s.items.find(
            (x) => x.productId === item.productId && x.size === item.size && x.color === item.color
          );
          if (existing) {
            return {
              items: s.items.map((x) =>
                x.productId === item.productId && x.size === item.size && x.color === item.color
                  ? { ...x, qty: Math.min(10, x.qty + qty) }
                  : x
              ),
            };
          }
          return {
            items: [
              ...s.items,
              {
                ...item,
                id: key,
                qty,
              },
            ],
          };
        });

        void commerceApi
          .addItem({
            productId: item.productId,
            size: item.size,
            color: item.color,
            qty,
          })
          .then((cart) => applyCart(set, cart))
          .catch((err) => {
            console.warn("[cart] add failed", err);
            void get().refresh();
          });
      },
      setQty: (id, qty) => {
        const next = Math.max(1, Math.min(10, qty));
        set((s) => ({
          items: s.items.map((x) => (x.id === id ? { ...x, qty: next } : x)),
        }));
        void commerceApi
          .updateItem(id, { qty: next })
          .then((cart) => applyCart(set, cart))
          .catch((err) => {
            console.warn("[cart] setQty failed", err);
            void get().refresh();
          });
      },
      remove: (id) => {
        set((s) => ({ items: s.items.filter((x) => x.id !== id) }));
        void commerceApi
          .removeItem(id)
          .then((cart) => applyCart(set, cart))
          .catch((err) => {
            console.warn("[cart] remove failed", err);
            void get().refresh();
          });
      },
      clear: () => {
        set({ items: [] });
        void commerceApi
          .clearCart()
          .then((cart) => applyCart(set, cart))
          .catch(() => set({ items: [], busy: false }));
      },
    }),
    {
      name: "asl-cart",
      partialize: (s) => ({ guestToken: s.guestToken }),
    }
  )
);

export const useCartCount = () =>
  useCart((s) => s.items.reduce((n, x) => n + x.qty, 0));
export const useCartSubtotal = () =>
  useCart((s) => s.items.reduce((n, x) => n + x.qty * x.price, 0));
