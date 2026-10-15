import { useEffect, useState } from "react";
import { koboToNaira } from "@/lib/api/client";
import {
  loyaltyApi,
  type ApiConciergeCart,
  type ApiConciergeRequest,
  type ApiConciergeTrack,
} from "@/lib/api/loyalty";
import type { RecentRequest, StatusKey } from "@/components/account/accountData";
import type { ConciergeCartItem, ConciergeStatus } from "@/components/concierge-checkout/conciergeCheckoutData";

const STATUS_KEYS = new Set<StatusKey>([
  "In Transit",
  "Order Confirmed",
  "Sourcing",
  "Completed",
  "Cancelled",
]);

export function mapConciergeStatus(label: string | undefined | null, key?: string | null): StatusKey {
  if (label && STATUS_KEYS.has(label as StatusKey)) return label as StatusKey;
  const k = (key ?? "").toLowerCase();
  if (k === "in_transit") return "In Transit";
  if (k === "delivered") return "Completed";
  if (k === "cancelled" || k === "unavailable") return "Cancelled";
  if (k === "approved" || k === "payment_pending" || k === "ordered") return "Order Confirmed";
  return "Sourcing";
}

export function toRecentRequest(r: ApiConciergeRequest): RecentRequest {
  const date = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";
  return {
    id: r.number || r.id,
    name: r.itemName,
    detail: [r.brand, r.category].filter(Boolean).join(" · ") || r.statusNote || "",
    size: r.size ?? undefined,
    colour: r.color ?? undefined,
    condition: r.condition ?? undefined,
    status: mapConciergeStatus(r.status, r.statusKey),
    date,
    update: r.statusNote || r.status,
    image: r.image || "/favicon.png",
  };
}

export function toCartItem(r: ApiConciergeRequest): ConciergeCartItem {
  const cartStatus = (r.cartStatus || "Sourcing in Progress") as ConciergeStatus;
  return {
    id: r.id,
    name: r.itemName,
    brand: r.brand || "ASL",
    image: r.image || "/favicon.png",
    size: r.size ?? undefined,
    condition: r.condition || "New",
    source: r.source || "Concierge",
    status: cartStatus,
    statusNote: r.statusNote || "",
    price: r.price != null ? koboToNaira(r.price) : 0,
    qty: r.qty ?? 1,
  };
}

export function useMyConciergeRequests(tab?: string) {
  const [rows, setRows] = useState<RecentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabs, setTabs] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loyaltyApi
      .myConciergeRequests({ tab, pageSize: 50 })
      .then(({ data, meta }) => {
        if (cancelled) return;
        setRows((data ?? []).map(toRecentRequest));
        const t = (meta as { tabs?: Record<string, number> } | undefined)?.tabs;
        if (t) setTabs(t);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[concierge] requests", err);
        setRows([]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return { rows, loading, tabs };
}

export function useConciergeCart() {
  const [cart, setCart] = useState<ApiConciergeCart | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    return loyaltyApi
      .conciergeCart()
      .then((c) => {
        setCart(c);
        setLoading(false);
        return c;
      })
      .catch((err) => {
        console.warn("[concierge] cart", err);
        setCart(null);
        setLoading(false);
        return null;
      });
  };

  useEffect(() => {
    void reload();
  }, []);

  const items = (cart?.items ?? []).map(toCartItem);
  const summary = cart?.summary
    ? {
        subtotal: koboToNaira(cart.summary.subtotal),
        serviceFee: koboToNaira(cart.summary.serviceFee),
        shippingEstimate: koboToNaira(cart.summary.shippingEstimate),
        estimatedTotal: koboToNaira(cart.summary.estimatedTotal),
      }
    : { subtotal: 0, serviceFee: 0, shippingEstimate: 0, estimatedTotal: 0 };

  return { cart, items, summary, loading, reload, raw: cart?.items ?? [] };
}

export async function trackConciergeRequest(number: string, email?: string): Promise<ApiConciergeTrack | null> {
  try {
    return await loyaltyApi.trackConcierge(number, email);
  } catch (err) {
    console.warn("[concierge] track", err);
    return null;
  }
}

export function trackToActive(track: ApiConciergeTrack, fallbackImage: string) {
  const date = track.createdAt
    ? new Date(track.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
    : "";
  return {
    id: track.number,
    date,
    item: track.itemName,
    size: track.size || "One size",
    color: track.color || "As described",
    status: (track.status || "SOURCING").toUpperCase(),
    tracking: track.number,
    courier: "ASL Concierge",
    estimated: track.statusNote || "",
    image: track.image || fallbackImage,
    trackStep: track.trackStep ?? 0,
  };
}
