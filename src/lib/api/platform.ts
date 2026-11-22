import { apiRequest } from "./client";

export type DownloadOfferConfig = {
  enabled: boolean;
  percent: number;
  label: string;
  validDays: number;
};

export const appConfigStoreApi = {
  get: () => apiRequest<Record<string, unknown>>("/store/app/config"),
  saveConsent: (body: {
    anonId: string;
    choices: { performance: boolean; functional: boolean; advertising: boolean };
  }) => apiRequest("/store/app/consent", { method: "POST", body }),
  claimDownloadOffer: () =>
    apiRequest<{
      code: string;
      label: string;
      pct: number;
      alreadyClaimed: boolean;
      expiresAt?: string | null;
    }>("/store/app/download-offer/claim", { method: "POST" }),
};
