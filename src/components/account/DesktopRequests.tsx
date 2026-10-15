import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Plus, ListFilter, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { statusStyle, type StatusKey } from "./accountData";
import { useMyConciergeRequests } from "@/lib/concierge-requests";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

type TabKey = "all" | "progress" | "completed" | "cancelled";

const progressStatuses: StatusKey[] = ["Sourcing", "Order Confirmed", "In Transit"];

const tabs: { id: TabKey; label: string; Icon: typeof ListFilter }[] = [
  { id: "all", label: "All Requests", Icon: ListFilter },
  { id: "progress", label: "In Progress", Icon: Loader2 },
  { id: "completed", label: "Completed", Icon: CheckCircle2 },
  { id: "cancelled", label: "Cancelled", Icon: XCircle },
];

export function DesktopRequests() {
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

  const counts = useMemo(
    () => ({
      all: allRows.length,
      progress: allRows.filter((r) => progressStatuses.includes(r.status)).length,
      completed: allRows.filter((r) => r.status === "Completed").length,
      cancelled: allRows.filter((r) => r.status === "Cancelled").length,
    }),
    [allRows]
  );

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="requests" />

        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">My Requests</h1>
              <p className="text-sm text-muted-foreground mt-1">View and manage all your concierge requests in one place.</p>
            </div>
            <button
              onClick={() => navigate({ to: "/start-request" })}
              className="inline-flex items-center gap-2 bg-ink text-white text-sm font-semibold px-4 py-2.5 rounded-md hover:bg-ink/90"
            >
              <Plus className="h-4 w-4" /> New Request
            </button>
          </motion.div>

          {/* Tabs */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const active = t.id === tab;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`shrink-0 flex min-h-10 items-center justify-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold border transition-colors ${
                    active ? "bg-ink text-white border-ink" : "bg-card text-foreground/70 border-border hover:bg-muted/50"
                  }`}
                >
                  <t.Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>
                    {t.label} ({counts[t.id]})
                  </span>
                </button>
              );
            })}
          </div>

          {/* Rows */}
          <motion.div
            key={tab}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="mt-5 space-y-3"
          >
            {rows.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-10 text-center text-[13px] text-muted-foreground">
                No requests yet. Start a new concierge request to see it here.
              </div>
            ) : (
              rows.map((r) => (
                <motion.button
                  key={r.id}
                  variants={staggerItem}
                  onClick={() => navigate({ to: "/track-request", search: { id: r.id } })}
                  className="w-full grid grid-cols-[80px_1.4fr_1fr_1.2fr_20px] items-center gap-4 border border-border rounded-lg bg-card p-4 text-left hover:shadow-sm transition-shadow"
                >
                  <img src={r.image} alt={r.name} className="h-16 w-16 rounded-md object-cover bg-muted" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] leading-tight">{r.name}</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">{r.detail}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {r.size && <>Size: {r.size} &nbsp;|&nbsp; </>}
                      {r.condition && <>Condition: {r.condition} &nbsp;|&nbsp; </>}
                      {r.colour && <>Colour: {r.colour}</>}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Status</div>
                    <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-2">Request ID</div>
                    <div className="text-[12px] font-medium">{r.id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Last Update</div>
                    <div className="text-[12px] mt-1">{r.date}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">{r.update}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground justify-self-end" />
                </motion.button>
              ))
            )}
          </motion.div>

          <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-ink" />
            That's all of your requests
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
