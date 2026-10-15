import { usePublicSettingsStore } from "@/lib/public-settings-store";

export const publicSettingsQueryKey = ["store", "settings", "public"] as const;

/** Read public business rules hydrated at app startup. */
export function usePublicSettings() {
  const settings = usePublicSettingsStore((s) => s.settings);
  const hydrated = usePublicSettingsStore((s) => s.hydrated);
  return { data: settings, isLoading: !hydrated, isSuccess: hydrated && settings != null };
}
