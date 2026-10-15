import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, CheckCircle2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { statusStyle, type StatusKey } from "./accountData";
import { useMyConciergeRequests } from "@/lib/concierge-requests";
import { staggerContainer, staggerItem } from "@/lib/motion";

type TabKey = "all" | "progress" | "completed" | "cancelled";
const progressStatuses: StatusKey[] = ["Sourcing", "Order Confirmed", "In Transit"];

const tabs: { id: TabKey; label: string }[] = [
  { id: "all", label: "All" },
  { id: "progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

export function MobileRequests() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("all");
  const { rows: allRows } = useMyConciergeRequests();
  const rows = useMemo(() => {
    return allRows.filter((r) => {
      if (tab === "all") return true;
      if (tab === "progress") return progressStatuses.includes(r.status);
      if (tab === "completed") return r.status === "Completed";
      return r.status === "Cancelled";
    });
  }, [allRows, tab]);

  return (
    <MobileShell
      activeBottom="account"
      headerVariant="shop"
      showTopTabs={false}
      title="My Requests"
    >
      <div className="px-3 pt-3 pb-6 space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {tabs.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 min-h-9 text-[12px] font-semibold px-3.5 py-2 rounded-full border transition-colors ${
                  active ? "bg-ink border-ink text-white" : "bg-card text-foreground/70 border-border"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* New request */}
        <button
          onClick={() => navigate({ to: "/start-request" })}
          className="w-full inline-flex min-h-11 items-center justify-center gap-2 bg-ink text-white text-sm font-semibold py-2.5 rounded-md"
        >
          <Plus className="h-4 w-4" /> New Request
        </button>

        {/* Rows */}
        <motion.div
          key={tab}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {rows.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-6 text-center text-[13px] text-muted-foreground">
              No requests yet. Start a new concierge request to see it here.
            </div>
          ) : (
            rows.map((r) => (
              <motion.button
                key={r.id}
                variants={staggerItem}
                whileTap={{ scale: 0.99 }}
                onClick={() => navigate({ to: "/track-request", search: { id: r.id } })}
                className="w-full flex items-center gap-2.5 p-2.5 border border-border rounded-md bg-card text-left"
              >
                <img src={r.image} alt={r.name} className="h-14 w-14 rounded-md object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold leading-tight truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.detail}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">ID: {r.id}</div>
                  <span className={`inline-block mt-1 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${statusStyle[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </motion.button>
            ))
          )}
        </motion.div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-ink" />
          That's all of your requests
        </div>
      </div>
    </MobileShell>
  );
}
