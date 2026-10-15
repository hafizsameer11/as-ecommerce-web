import { create } from "zustand";
import { cmsApi, type StoreAnnouncement } from "@/lib/api/cms";

export type AnnStatus = "live" | "scheduled" | "paused" | "expired";
export type AnnStyle = "solid" | "gradient" | "outline" | "minimal";
export type AnnPlacement = "site_top" | "checkout_top" | "admin_top";
export type AnnAudience = "everyone" | "guests" | "members" | "club_gold" | "club_signature";
export type AnnDevice = "all" | "mobile" | "desktop";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  emoji?: string;
  ctaLabel?: string;
  ctaHref?: string;
  style: AnnStyle;
  bg: string;
  fg: string;
  placement: AnnPlacement;
  audience: AnnAudience;
  device: AnnDevice;
  dismissible: boolean;
  priority: number;
  startsAt?: string;
  endsAt?: string;
  status: AnnStatus;
  impressions: number;
  clicks: number;
  dismisses: number;
  updatedAt: string;
};

function mapRow(r: StoreAnnouncement): Announcement {
  const style = (r.style as AnnStyle) || "solid";
  const placement = (r.placement as AnnPlacement) || "site_top";
  const audience = (r.audience as AnnAudience) || "everyone";
  const device = (r.device as AnnDevice) || "all";
  return {
    id: r.id,
    title: "",
    message: r.message,
    emoji: r.emoji ?? undefined,
    ctaLabel: r.ctaLabel ?? undefined,
    ctaHref: r.ctaHref ?? undefined,
    style,
    bg: r.bg || "#0d0d0d",
    fg: r.fg || "#ffffff",
    placement,
    audience,
    device,
    dismissible: r.dismissible !== false,
    priority: r.priority ?? 1,
    endsAt: r.endsAt ?? undefined,
    status: "live",
    impressions: 0,
    clicks: 0,
    dismisses: 0,
    updatedAt: new Date().toISOString(),
  };
}

type State = {
  items: Announcement[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

export const useAnnouncements = create<State>()((set) => ({
  items: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const rows = await cmsApi.announcements();
      set({ items: (rows ?? []).map(mapRow), hydrated: true });
    } catch (err) {
      console.warn("[announcements] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));
