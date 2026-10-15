import { koboToNaira } from "@/lib/api/client";
import type { PublicSettings } from "@/lib/api/auth";

function section<T extends Record<string, unknown>>(settings: PublicSettings | null | undefined, key: string): T | undefined {
  const block = settings?.[key];
  return block && typeof block === "object" ? (block as T) : undefined;
}

export function freeShippingThresholdNaira(settings: PublicSettings | null | undefined): number | null {
  const raw = section<{ freeShippingThreshold?: number }>(settings, "shipping")?.freeShippingThreshold;
  if (raw == null || !Number.isFinite(raw)) return null;
  return koboToNaira(raw);
}

export function returnWindowDays(settings: PublicSettings | null | undefined): number | null {
  const days = section<{ windowDays?: number }>(settings, "returns")?.windowDays;
  if (days == null || !Number.isFinite(days)) return null;
  return days;
}
