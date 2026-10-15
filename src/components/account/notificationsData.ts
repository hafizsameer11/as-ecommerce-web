import { create } from "zustand";
import { Package, ShoppingBag, Tag, Crown, User, Heart, Bell, LucideIcon } from "lucide-react";
import { cmsApi } from "@/lib/api/cms";

export type NotifCategory = "All" | "Orders" | "Offers" | "Account" | "Wishlist" | "ASL Club" | "Updates";
export const notifCategories: NotifCategory[] = [
  "All",
  "Orders",
  "Offers",
  "Account",
  "Wishlist",
  "ASL Club",
  "Updates",
];

export type Notif = {
  id: string;
  tag?: string;
  title: string;
  message: string;
  cta: string;
  ctaTo?: string;
  time: string;
  unread?: boolean;
  category: Exclude<NotifCategory, "All">;
  Icon: LucideIcon;
};

const ICON_BY_CAT: Record<Exclude<NotifCategory, "All">, LucideIcon> = {
  Orders: Package,
  Offers: Tag,
  Account: User,
  Wishlist: Heart,
  "ASL Club": Crown,
  Updates: ShoppingBag,
};

function mapCategory(raw?: string): Exclude<NotifCategory, "All"> {
  const key = (raw || "").toLowerCase();
  if (key.includes("order") || key.includes("ship") || key.includes("return")) return "Orders";
  if (key.includes("offer") || key.includes("promo") || key.includes("sale")) return "Offers";
  if (key.includes("wish")) return "Wishlist";
  if (key.includes("club") || key.includes("reward") || key.includes("point")) return "ASL Club";
  if (key.includes("account") || key.includes("profile") || key.includes("security")) return "Account";
  return "Updates";
}

function relTime(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function mapRow(r: Record<string, unknown>): Notif {
  const category = mapCategory(String(r.category || r.topic || ""));
  return {
    id: String(r.id),
    tag: r.unread || !r.readAt ? "NEW" : undefined,
    title: String(r.title || "Notification"),
    message: String(r.body || r.message || ""),
    cta: String(r.ctaLabel || r.cta || "View"),
    ctaTo: r.ctaHref || r.linkTo ? String(r.ctaHref || r.linkTo) : undefined,
    time: relTime(String(r.createdAt || r.at || "")),
    unread: !!(r.unread ?? !r.readAt),
    category,
    Icon: ICON_BY_CAT[category] || Bell,
  };
}

type State = {
  notifications: Notif[];
  unreadCount: number;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const useNotifications = create<State>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  hydrated: false,
  hydrate: async () => {
    try {
      const [{ data, meta }, unread] = await Promise.all([
        cmsApi.notifications({ page: 1 }),
        cmsApi.unreadCount().catch(() => ({ count: 0 })),
      ]);
      const rows = (data as Record<string, unknown>[]) ?? [];
      set({
        notifications: rows.map(mapRow),
        unreadCount: Number((unread as { count?: number })?.count ?? meta?.unread ?? 0),
        hydrated: true,
      });
    } catch (err) {
      console.warn("[notifications] hydrate failed", err);
      set({ hydrated: true });
    }
  },
  markRead: async (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, unread: false, tag: undefined } : n
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try {
      await cmsApi.markRead(id);
    } catch (err) {
      console.warn("[notifications] markRead", err);
      await get().hydrate();
    }
  },
  markAllRead: async () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, unread: false, tag: undefined })),
      unreadCount: 0,
    }));
    try {
      await cmsApi.markAllRead();
    } catch (err) {
      console.warn("[notifications] markAllRead", err);
      await get().hydrate();
    }
  },
}));

/** @deprecated Prefer useNotifications */
export const notifications: Notif[] = [];
