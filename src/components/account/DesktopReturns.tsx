import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronRight, RotateCcw, Package, FileText, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { useReturns, returnStats, returnStatusStyle, ReturnStatus } from "./returnsData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

const statLink: Record<string, string> = {
  window: "/account/returns/policy",
  easy: "/account/returns/how-it-works",
  time: "/account/returns/details",
};

const tabs: { id: "all" | ReturnStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "In Progress", label: "In Progress" },
  { id: "Approved", label: "Approved" },
  { id: "Completed", label: "Completed" },
  { id: "Rejected", label: "Rejected" },
];

export function DesktopReturns() {
  const returnRequests = useReturns((s) => s.returnRequests);
  const hydrate = useReturns((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const [tab, setTab] = useState<"all" | ReturnStatus>("all");
  const filtered = tab === "all" ? returnRequests : returnRequests.filter((r) => r.status === tab);

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="returns" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-4xl font-bold">Returns & Exchanges</h1>
            <p className="text-sm text-muted-foreground mt-2">Read our policy, request a return, and track your refund.</p>
          </motion.div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-5">
            {returnStats.map((s) => (
              <motion.div key={s.id} initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                  <s.Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground font-semibold">{s.title}</div>
                  <div className="font-display text-2xl font-bold mt-1 leading-tight">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{s.sub}</div>
                  <Link to={statLink[s.id] as any} className="text-[11px] text-gold font-semibold mt-2 flex items-center gap-1">{s.cta} <ChevronRight className="h-3 w-3" /></Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA banner */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
            <div className="h-11 w-11 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
              <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-[15px]">Need to return an item?</div>
              <div className="text-[12px] text-muted-foreground">Start your return request in a few simple steps.</div>
            </div>
            <Link to="/account/returns/start" className="px-5 py-2.5 rounded-md bg-ink text-white text-[13px] font-semibold">Start a Return Request</Link>
          </motion.div>

          {/* Return Requests */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Return Requests</h2>
              <span className="text-[12px] font-semibold text-gold flex items-center gap-1">View all requests <ChevronRight className="h-3 w-3" /></span>
            </div>

            <div className="mt-4 flex items-center gap-2 border-b border-border pb-3">
              {tabs.map((t) => {
                const active = tab === t.id;
                const count = t.id === "all" ? returnRequests.length : returnRequests.filter((r) => r.status === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`px-4 py-2 rounded-md text-[12px] font-semibold transition-colors ${
                      active ? "bg-ink text-white" : "text-foreground/70 hover:bg-muted/50"
                    }`}
                  >
                    {t.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="mt-4 divide-y divide-border">
              {filtered.map((r) => (
                <motion.div key={r.id} variants={staggerItem} className="py-5 grid grid-cols-[80px_1.5fr_1fr_1.5fr_auto] items-center gap-5">
                  <div className="h-20 w-20 rounded-lg bg-muted overflow-hidden">
                    <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-semibold text-[14px]">{r.name}</div>
                    <div className="text-[12px] text-muted-foreground">{r.detail}</div>
                    <div className="text-[11px] text-muted-foreground mt-2">
                      {r.size && <>Size: {r.size} &nbsp;|&nbsp; </>}Order ID: #{r.orderId}
                    </div>
                    <div className="text-[11px] text-muted-foreground">Requested on: {r.requestedOn}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Reason</div>
                    <div className="text-[13px] mt-1">{r.reason}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Status</div>
                    <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${returnStatusStyle[r.status]}`}>{r.status}</span>
                    <div className="text-[11px] text-muted-foreground mt-1 max-w-[220px]">{r.statusNote}</div>
                  </div>
                  <button className="px-4 py-2 rounded-md border border-border text-[12px] font-semibold flex items-center gap-1 whitespace-nowrap">
                    View Details <ChevronRight className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Policy footer */}
          <div className="rounded-xl bg-gold/5 border border-gold/20 p-6">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div className="font-display font-bold text-[15px] leading-tight">Our Return<br />& Refund Policy</div>
              </div>
              {[
                { Icon: Package, v: "3 - 7 Days", l: "Return window" },
                { Icon: CheckCircle2, v: "Original Condition", l: "Items must be unused" },
                { Icon: ShieldCheck, v: "Secure Process", l: "Safe & easy returns" },
                { Icon: Clock, v: "5 - 10 Days", l: "Refund processing" },
              ].map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <p.Icon className="h-5 w-5 text-gold" strokeWidth={1.5} />
                  <div>
                    <div className="text-[12px] font-semibold">{p.v}</div>
                    <div className="text-[11px] text-muted-foreground">{p.l}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-[12px] text-muted-foreground mt-5 pt-4 border-t border-gold/20">
              For more information, please read our full <Link to="/account/returns/policy" className="text-gold font-semibold underline">Refund Policy.</Link>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
