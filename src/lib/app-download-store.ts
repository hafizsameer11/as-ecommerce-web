import { create } from "zustand";
import { persist } from "zustand/middleware";
import { appConfigStoreApi, type DownloadOfferConfig } from "@/lib/api/platform";

type ClaimResult = {
  code: string;
  label: string;
  pct: number;
  alreadyClaimed: boolean;
  expiresAt?: string | null;
};

type AppDownloadState = {
  offer: DownloadOfferConfig | null;
  claimResult: ClaimResult | null;
  dismissedAt: number | null;
  claimedAt: number | null;
  installedAt: number | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  dismiss: () => void;
  claim: () => Promise<ClaimResult | null>;
  markInstalled: () => void;
  reset: () => void;
};

const DEFAULT_OFFER: DownloadOfferConfig = {
  enabled: true,
  percent: 10,
  label: "App Download Reward",
  validDays: 30,
};

function mapOffer(raw: unknown): DownloadOfferConfig {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    enabled: o.enabled !== false,
    percent: Number(o.percent ?? DEFAULT_OFFER.percent),
    label: String(o.label ?? DEFAULT_OFFER.label),
    validDays: Number(o.validDays ?? DEFAULT_OFFER.validDays),
  };
}

export const useAppDownload = create<AppDownloadState>()(
  persist(
    (set, get) => ({
      offer: null,
      claimResult: null,
      dismissedAt: null,
      claimedAt: null,
      installedAt: null,
      hydrated: false,
      hydrate: async () => {
        if (get().hydrated) return;
        try {
          const pub = (await appConfigStoreApi.get()) as Record<string, unknown>;
          set({ offer: mapOffer(pub.downloadOffer), hydrated: true });
        } catch (err) {
          console.warn("[app-download] hydrate failed", err);
          set({ offer: DEFAULT_OFFER, hydrated: true });
        }
      },
      dismiss: () => set({ dismissedAt: Date.now() }),
      claim: async () => {
        try {
          const result = await appConfigStoreApi.claimDownloadOffer();
          set({ claimedAt: Date.now(), claimResult: result });
          return result;
        } catch (err) {
          console.warn("[app-download] claim", err);
          set({ claimedAt: Date.now() });
          return null;
        }
      },
      markInstalled: () => set({ installedAt: Date.now() }),
      reset: () =>
        set({
          dismissedAt: null,
          claimedAt: null,
          installedAt: null,
          claimResult: null,
        }),
    }),
    {
      name: "asl-app-download-v1",
      partialize: (s) => ({
        dismissedAt: s.dismissedAt,
        claimedAt: s.claimedAt,
        installedAt: s.installedAt,
        claimResult: s.claimResult,
      }),
    }
  )
);
