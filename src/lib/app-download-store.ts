import { create } from "zustand";
import { persist } from "zustand/middleware";

type AppDownloadState = {
  dismissedAt: number | null;
  claimedAt: number | null;
  installedAt: number | null;
  dismiss: () => void;
  claim: () => void;
  markInstalled: () => void;
  reset: () => void;
};

export const useAppDownload = create<AppDownloadState>()(
  persist(
    (set) => ({
      dismissedAt: null,
      claimedAt: null,
      installedAt: null,
      dismiss: () => set({ dismissedAt: Date.now() }),
      claim: () => set({ claimedAt: Date.now() }),
      markInstalled: () => set({ installedAt: Date.now() }),
      reset: () => set({ dismissedAt: null, claimedAt: null, installedAt: null }),
    }),
    { name: "asl-app-download-v1" }
  )
);
