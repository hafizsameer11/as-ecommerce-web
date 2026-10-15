import { create } from "zustand";
import { storeSettingsApi, type PublicSettings } from "@/lib/api/auth";

type State = {
  settings: PublicSettings | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

export const usePublicSettingsStore = create<State>()((set, get) => ({
  settings: null,
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated && get().settings) return;
    try {
      const settings = await storeSettingsApi.public();
      set({ settings, hydrated: true });
    } catch (err) {
      console.warn("[public-settings] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));
