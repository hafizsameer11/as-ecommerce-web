import { create } from "zustand";
import { Package, Clock, ShieldCheck, LucideIcon } from "lucide-react";
import { accountApi, type ApiReturnCard } from "@/lib/api/account";

export type ReturnStatus = "In Progress" | "Approved" | "Completed" | "Rejected";

export const returnStatusStyle: Record<ReturnStatus, string> = {
  "In Progress": "bg-amber-100 text-amber-700",
  Approved: "bg-ink text-white",
  Completed: "bg-neutral-200 text-neutral-700",
  Rejected: "bg-rose-100 text-rose-700",
};

export type ReturnRequest = {
  id: string;
  orderId: string;
  name: string;
  detail: string;
  size?: string;
  reason: string;
  status: ReturnStatus;
  statusNote: string;
  requestedOn: string;
  image: string;
};

export type ReturnStat = {
  id: string;
  Icon: LucideIcon;
  title: string;
  value: string;
  sub: string;
  cta: string;
};

export const returnStats: ReturnStat[] = [
  {
    id: "window",
    Icon: Clock,
    title: "Return window",
    value: "14 days",
    sub: "From delivery date",
    cta: "Read policy",
  },
  {
    id: "easy",
    Icon: Package,
    title: "Easy returns",
    value: "Pickup",
    sub: "Complimentary in Lagos",
    cta: "How it works",
  },
  {
    id: "time",
    Icon: ShieldCheck,
    title: "Refunds",
    value: "5–7 days",
    sub: "After inspection",
    cta: "Refund details",
  },
];

function mapReturn(r: ApiReturnCard): ReturnRequest {
  const status = (r.statusLabel || r.status || "In Progress") as ReturnStatus;
  const valid: ReturnStatus[] = ["In Progress", "Approved", "Completed", "Rejected"];
  return {
    id: r.number || r.id,
    orderId: String(r.orderNumber || r.orderId || ""),
    name: String(r.name || "Return item"),
    detail: String(r.detail || ""),
    size: r.size ? String(r.size) : undefined,
    reason: String(r.reason || ""),
    status: valid.includes(status) ? status : "In Progress",
    statusNote: String(r.statusNote || ""),
    requestedOn: r.createdAt || r.requestedOn
      ? new Date(String(r.createdAt || r.requestedOn)).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    image: String(r.image || "/favicon.png"),
  };
}

type State = {
  returnRequests: ReturnRequest[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
};

export const useReturns = create<State>()((set) => ({
  returnRequests: [],
  hydrated: false,
  hydrate: async () => {
    try {
      const rows = await accountApi.myReturns();
      set({ returnRequests: rows.map(mapReturn), hydrated: true });
    } catch (err) {
      console.warn("[returns] hydrate failed", err);
      set({ hydrated: true });
    }
  },
}));

/** @deprecated Prefer useReturns */
export const returnRequests: ReturnRequest[] = [];
