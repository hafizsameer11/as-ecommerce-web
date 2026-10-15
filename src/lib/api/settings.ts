import { useQuery } from "@tanstack/react-query";
import { storeSettingsApi } from "./auth";

export const publicSettingsQueryKey = ["store", "settings", "public"] as const;

/** Prefetch/read public business rules from the API (do not hard-code fees in UI). */
export function usePublicSettings() {
  return useQuery({
    queryKey: publicSettingsQueryKey,
    queryFn: () => storeSettingsApi.public(),
    staleTime: 5 * 60_000,
  });
}
