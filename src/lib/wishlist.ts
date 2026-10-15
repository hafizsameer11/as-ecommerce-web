import { create } from "zustand";
import { persist } from "zustand/middleware";
import { commerceApi } from "@/lib/api/commerce";
import { useAuth } from "@/lib/auth-store";

export type WishlistVariation = { size?: string; color?: string };

type WishlistState = {
  ids: string[];
  variations: Record<string, WishlistVariation>;
  toggle: (id: string, variation?: WishlistVariation) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  refresh: () => Promise<void>;
  mergeLocal: () => Promise<void>;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      variations: {},
      refresh: async () => {
        if (!useAuth.getState().isLoggedIn) return;
        try {
          const ids = await commerceApi.wishlistIds();
          set({ ids });
        } catch (err) {
          console.warn("[wishlist] refresh failed", err);
        }
      },
      mergeLocal: async () => {
        if (!useAuth.getState().isLoggedIn) return;
        const { ids, variations } = get();
        if (!ids.length) {
          await get().refresh();
          return;
        }
        try {
          await commerceApi.mergeWishlist(
            ids.map((productId) => ({
              productId,
              size: variations[productId]?.size,
              color: variations[productId]?.color,
            }))
          );
          await get().refresh();
        } catch (err) {
          console.warn("[wishlist] merge failed", err);
        }
      },
      toggle: (id, variation) => {
        const wasSaved = get().ids.includes(id);
        set((s) => {
          if (s.ids.includes(id)) {
            const variations = { ...s.variations };
            delete variations[id];
            return { ids: s.ids.filter((x) => x !== id), variations };
          }
          return {
            ids: [...s.ids, id],
            variations: { ...s.variations, [id]: variation ?? {} },
          };
        });

        if (!useAuth.getState().isLoggedIn) return;

        void (wasSaved ? commerceApi.removeWishlist(id) : commerceApi.toggleWishlist(id, variation))
          .then(() => get().refresh())
          .catch((err) => {
            console.warn("[wishlist] sync failed", err);
            void get().refresh();
          });
      },
      remove: (id) => {
        set((s) => {
          const variations = { ...s.variations };
          delete variations[id];
          return { ids: s.ids.filter((x) => x !== id), variations };
        });
        if (!useAuth.getState().isLoggedIn) return;
        void commerceApi.removeWishlist(id).catch(() => undefined);
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "asl-wishlist" }
  )
);

export const useWishlistCount = () => useWishlist((s) => s.ids.length);
export const useIsWished = (id: string) =>
  useWishlist((s) => s.ids.includes(id));
export const useWishlistVariation = (id: string) =>
  useWishlist((s) => s.variations[id]);
