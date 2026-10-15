import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Package, Search, Truck, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { useNavigate } from "@tanstack/react-router";

import { AccountSidebar } from "./AccountSidebar";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import {
  orderStatusStyle,
  orderTabs,
  formatNaira,
  type OrderStatus,
} from "./ordersData";
import { useAllOrders, useOrders } from "@/lib/orders-store";
import { accountApi } from "@/lib/api/account";
import { downloadOrderInvoice } from "@/lib/order-actions";

export function DesktopOrders() {
  const nav = useNavigate();
  const orders = useAllOrders();
  const hydrate = useOrders((s) => s.hydrate);
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const stats = useMemo(() => {
    const inTransit = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const returns = orders.filter((o) => o.status === "Returned").length;
    return [
      { id: "total", label: "Total Orders", value: String(orders.length), Icon: Package, cta: "View all", tab: "all" as const },
      { id: "transit", label: "In Transit", value: String(inTransit), Icon: Truck, cta: "Track", tab: "Shipped" as const },
      { id: "delivered", label: "Delivered", value: String(delivered), Icon: CheckCircle2, cta: "History", tab: "Delivered" as const },
      { id: "returns", label: "Returns", value: String(returns), Icon: RotateCcw, cta: "Manage", tab: "Returned" as const },
    ];
  }, [orders]);

  const filtered = orders.filter((o) => {
    if (tab !== "all" && o.status !== tab) return false;
    if (q && !(`${o.id} ${o.items.map((i) => i.name).join(" ")}`.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="orders" />

        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">My Orders</h1>
              <p className="text-sm text-muted-foreground mt-1">Track, return or buy again.</p>
            </div>
            <div className="relative w-72">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search order # or item"
                className="w-full pl-9 pr-3 py-2 text-[13px] border border-border rounded-md bg-card focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-6 grid grid-cols-4 gap-4">
            {stats.map((s) => (
              <motion.div key={s.id} variants={staggerItem} className="border border-border rounded-lg p-4 bg-card">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-md bg-muted grid place-items-center shrink-0">
                    <s.Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{s.label}</div>
                    <div className="font-display font-bold text-2xl mt-0.5">{s.value}</div>
                    <button onClick={() => setTab(s.tab)} className="text-[11px] text-gold hover:underline mt-1">
                      {s.cta}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <div className="mt-8 flex items-center gap-1 border-b border-border">
            {orderTabs.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors ${
                    active ? "border-gold text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Orders */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-5 space-y-4">
            {filtered.length === 0 && (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <Package className="h-8 w-8 mx-auto text-muted-foreground" strokeWidth={1.5} />
                <p className="mt-3 text-sm text-muted-foreground">No orders found.</p>
              </div>
            )}
            {filtered.map((o) => (
              <motion.div key={o.id} variants={staggerItem} className="border border-border rounded-lg bg-card overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 px-5 py-3 bg-muted/40 border-b border-border">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Order</div>
                    <div className="text-[13px] font-medium">{o.id}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Placed</div>
                    <div className="text-[13px]">{o.date}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total</div>
                    <div className="text-[13px] font-semibold">{formatNaira(o.total)}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${orderStatusStyle[o.status]}`}>
                      {o.status}
                    </span>
                    <Link to="/account/orders/$id" params={{ id: o.id }} className="text-[11px] text-gold font-semibold hover:underline flex items-center gap-1">
                      View details <ChevronRight className="h-3 w-3" />
                    </Link>

                  </div>
                </div>

                <div className="divide-y divide-border">
                  {o.items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-4 px-5 py-4">
                      <img src={it.image} alt={it.name} className="h-14 w-14 rounded-md object-cover bg-muted" />
                      <div className="flex-1 min-w-0">
                        {it.brand && <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{it.brand}</div>}
                        <div className="text-[13px] font-medium">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground">{it.variant} · Qty {it.qty}</div>
                      </div>
                      <div className="text-[13px] font-semibold">{formatNaira(it.price)}</div>
                    </div>
                  ))}
                </div>

                <div className="px-5 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="text-[11px] text-muted-foreground">
                    {o.eta && <>Estimated delivery: <span className="text-foreground font-medium">{o.eta}</span></>}
                    {o.tracking && <span className="ml-3">Tracking number: <span className="text-foreground font-medium">{o.tracking}</span></span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {o.status === "Shipped" && (
                      <button onClick={() => nav({ to: "/account/track", search: { id: o.id } as any })} className="text-[11px] font-semibold px-3 py-1.5 rounded-md bg-ink text-white hover:opacity-90">
                        Track Order
                      </button>
                    )}
                    {o.status === "Delivered" && (
                      <button onClick={() => nav({ to: "/account/returns" })} className="text-[11px] font-semibold px-3 py-1.5 rounded-md border border-border hover:bg-muted">
                        Return / Exchange
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const apiId = o.apiId ?? o.id;
                        void accountApi
                          .reorder(apiId)
                          .then(() => {
                            toast.success("Items added to your bag");
                            nav({ to: "/cart" });
                          })
                          .catch((err) => toast.error(err instanceof Error ? err.message : "Could not reorder"));
                      }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                    >
                      Buy Again
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const apiId = o.apiId ?? o.id;
                        void downloadOrderInvoice(apiId, `invoice-${o.id}.pdf`)
                          .then(() => toast.success("Invoice downloaded"))
                          .catch((err) => toast.error(err instanceof Error ? err.message : "Could not download invoice"));
                      }}
                      className="text-[11px] font-semibold px-3 py-1.5 rounded-md border border-border hover:bg-muted"
                    >
                      Invoice
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </DesktopShell>
  );
}
