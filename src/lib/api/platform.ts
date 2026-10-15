import { apiRequest } from "./client";

export type DownloadOfferConfig = {
  enabled: boolean;
  percent: number;
  label: string;
  validDays: number;
};

export const appConfigStoreApi = {
  get: () => apiRequest<Record<string, unknown>>("/store/app/config"),
  claimDownloadOffer: () =>
    apiRequest<{
      code: string;
      label: string;
      pct: number;
      alreadyClaimed: boolean;
      expiresAt?: string | null;
    }>("/store/app/download-offer/claim", { method: "POST" }),
};
