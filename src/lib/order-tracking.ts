import { accountApi, type ApiOrderDetail, type ApiOrderTracking } from "@/lib/api/account";

export type TrackView = {
  number: string;
  status: string;
  statusKey: string;
  eta?: string | null;
  trackingNumber?: string | null;
  carrier?: string | null;
  delivery: string;
  timeline: Array<{ title: string; detail?: string | null; at: string; done: boolean }>;
  shipmentEvents: Array<{ title: string; detail?: string | null; at: string }>;
  order?: ApiOrderDetail | null;
};

function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function loadOrderTracking(orderRef: string): Promise<TrackView> {
  const [tracking, order] = await Promise.all([
    accountApi.tracking(orderRef),
    accountApi.myOrder(orderRef).catch(() => null),
  ]);
  return mapTracking(tracking, order);
}

export function mapTracking(tracking: ApiOrderTracking, order?: ApiOrderDetail | null): TrackView {
  const live = tracking.shipments?.[0];
  const trackingNumber = live?.trackingNumber ?? null;
  const carrier = live?.carrierLabel || live?.carrier || null;
  const timelineSrc =
    tracking.timeline?.length
      ? tracking.timeline
      : order?.timeline?.length
        ? order.timeline
        : [];
  const timeline = timelineSrc.map((t, i) => ({
    title: t.title,
    detail: t.detail ?? null,
    at: formatWhen(t.at),
    done: i < timelineSrc.length - 1 || !!tracking.deliveredAt || tracking.statusKey === "delivered",
  }));
  if (timeline.length) timeline[timeline.length - 1] = { ...timeline[timeline.length - 1], done: true };

  const shipmentEvents = (live?.events ?? []).map((e) => ({
    title: e.label || e.status.replace(/_/g, " "),
    detail: [e.location, e.note].filter(Boolean).join(" · ") || null,
    at: formatWhen(e.at),
  }));

  return {
    number: tracking.number,
    status: tracking.status,
    statusKey: tracking.statusKey,
    eta: tracking.eta ?? live?.etaAt ?? null,
    trackingNumber,
    carrier,
    delivery: tracking.delivery,
    timeline,
    shipmentEvents,
    order: order ?? null,
  };
}
