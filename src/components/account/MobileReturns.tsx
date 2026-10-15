import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ChevronRight, FileText, Info, RotateCcw } from "lucide-react";
import { MobileShell } from "@/components/shell/MobileShell";
import { useReturns, returnStatusStyle, ReturnStatus } from "./returnsData";
import { staggerContainer, staggerItem } from "@/lib/motion";

const tabs: { id: "all" | ReturnStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "In Progress", label: "In Progress" },
  { id: "Approved", label: "Approved" },
  { id: "Completed", label: "Completed" },
  { id: "Rejected", label: "Rejected" },
];

export function MobileReturns() {
  const returnRequests = useReturns((s) => s.returnRequests);
  const hydrate = useReturns((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const [tab, setTab] = useState<"all" | ReturnStatus>("all");
  const filtered = tab === "all" ? returnRequests : returnRequests.filter((r) => r.status === tab);

  return (
    <MobileShell activeBottom="account" headerVariant="shop" showTopTabs={false} title="Returns & Refunds">
      <div className="px-3 pt-4 pb-6 space-y-4">
        {/* CTA card */}
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
            <RotateCcw className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[13px]">Need to return an item?</div>
            <div className="text-[11px] text-muted-foreground">Start your return request in a few simple steps.</div>
          </div>
        </div>
        <Link to="/account/returns/start" className="block w-full py-3 rounded-md bg-ink text-white text-[13px] font-semibold text-center">Start a Return Request</Link>

        {/* Return Overview */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Return Overview</h2>
            <Link to="/account/returns/policy" className="text-[11px] font-semibold text-foreground/70 flex items-center gap-0.5">View policy <ChevronRight className="h-3 w-3" /></Link>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { v: "3 - 7 Days", l: "Return window" },
              { v: "Original", l: "Condition" },
              { v: "5 - 10 Days", l: "Refund time" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3 text-center">
                <div className="h-9 w-9 mx-auto rounded-full bg-gold/15 grid place-items-center text-gold text-[10px] font-bold">{i + 1}</div>
                <div className="font-display text-[13px] font-bold mt-2 leading-tight">{s.v}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {[
            { to: "/account/returns/policy", icon: FileText, title: "View Policy", desc: "Read our complete return & refund policy." },
            { to: "/account/returns/how-it-works", icon: RotateCcw, title: "How it Works", desc: "See how our return process works." },
            { to: "/account/returns/details", icon: Info, title: "More Details", desc: "Important information about returns." },
          ].map((item, i, arr) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 p-4 ${i !== arr.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="h-9 w-9 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px]">{item.title}</div>
                <div className="text-[11px] text-muted-foreground leading-snug">{item.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </Link>
          ))}
        </div>

        {/* Return Requests */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Return Requests</h2>
            <span className="text-[11px] font-semibold text-foreground/70 flex items-center gap-0.5">View all <ChevronRight className="h-3 w-3" /></span>
          </div>
          <div className="mt-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
            {tabs.map((t) => {
              const active = tab === t.id;
              const count = t.id === "all" ? returnRequests.length : returnRequests.filter((r) => r.status === t.id).length;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                    active ? "bg-ink text-white" : "border border-border text-foreground/70"
                  }`}
                >
                  {t.label} ({count})
                </button>
              );
            })}
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-3 space-y-3">
            {filtered.map((r) => (
              <motion.button key={r.id} variants={staggerItem} className="w-full flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-left">
                <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[13px] truncate">{r.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{r.detail}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Order ID: #{r.orderId}</div>
                  <div className="text-[10px] text-muted-foreground">Requested on: {r.requestedOn}</div>
                  <div className="text-[10px] text-muted-foreground">Reason: {r.reason}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Status:</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${returnStatusStyle[r.status]}`}>{r.status}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </MobileShell>
  );
}
