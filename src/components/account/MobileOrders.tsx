import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, Package, Truck, CheckCircle2, RotateCcw, ArrowLeft, ShoppingBag } from "lucide-react";
import { MobileShell } from "@/components/shell/MobileShell";

import { staggerContainer, staggerItem } from "@/lib/motion";
import {
  orderStatusStyle,
  orderTabs,
  formatNaira,
  type OrderStatus,
} from "./ordersData";
import { useAllOrders, useOrders } from "@/lib/orders-store";

export function MobileOrders() {
  const orders = useAllOrders();
  const hydrate = useOrders((s) => s.hydrate);
  const [tab, setTab] = useState<"all" | OrderStatus>("all");
  const filtered = orders.filter((o) => tab === "all" || o.status === tab);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const orderStats = useMemo(() => {
    const inTransit = orders.filter((o) => o.status === "Shipped").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const returns = orders.filter((o) => o.status === "Returned").length;
    return [
      { id: "total", label: "Total Orders", value: String(orders.length), Icon: Package },
      { id: "transit", label: "In Transit", value: String(inTransit), Icon: Truck },
      { id: "delivered", label: "Delivered", value: String(delivered), Icon: CheckCircle2 },
      { id: "returns", label: "Returns", value: String(returns), Icon: RotateCcw },
    ];
  }, [orders]);

  return (
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      {/* Sub header: back + title */}
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3">
          <button onClick={() => history.back()} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="text-center font-display font-bold text-[15px]">My Orders</h1>
          <Link to="/cart" aria-label="Bag" className="relative justify-self-end">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="px-3 pt-3 pb-6 space-y-4">
        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-2 border border-border rounded-lg p-3 bg-card"
        >
          {orderStats.map((s) => (
            <motion.div key={s.id} variants={staggerItem} className="flex flex-col items-center text-center">
              <s.Icon className="h-4 w-4 mb-1" strokeWidth={1.75} />
              <div className="font-display font-bold text-[15px] leading-tight">{s.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase tracking-wide mt-0.5">{s.label.replace("Total ", "")}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-3 px-3">
          {orderTabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active ? "bg-ink text-white border-ink" : "bg-card text-foreground/70 border-border"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Orders */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
          {filtered.length === 0 && (
            <div className="border border-dashed border-border rounded-lg p-10 text-center">
              <Package className="h-7 w-7 mx-auto text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-2 text-[12px] text-muted-foreground">No orders found.</p>
            </div>
          )}
          {filtered.map((o) => (
            <motion.div
              key={o.id}
              variants={staggerItem}
              className="w-full text-left border border-border rounded-lg bg-card overflow-hidden"
            >
              <Link to="/account/orders/$id" params={{ id: o.id }} className="block">

              <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
                <div className="min-w-0">
                  <div className="text-[10px] text-muted-foreground">{o.date}</div>
                  <div className="text-[12px] font-medium truncate">{o.id}</div>
                </div>
                <span className={`shrink-0 text-[9px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${orderStatusStyle[o.status]}`}>
                  {o.status}
                </span>
              </div>

              <div className="p-3 space-y-2">
                {o.items.slice(0, 2).map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <img src={it.image} alt={it.name} className="h-11 w-11 rounded-md object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      {it.brand && <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{it.brand}</div>}
                      <div className="text-[12px] font-medium truncate">{it.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{it.variant}</div>
                    </div>
                    <div className="text-[11px] font-semibold shrink-0">{formatNaira(it.price)}</div>
                  </div>
                ))}
                {o.items.length > 2 && (
                  <div className="text-[10px] text-muted-foreground">+{o.items.length - 2} more item(s)</div>
                )}
              </div>

              <div className="px-3 py-2 border-t border-border flex items-center justify-between">
                <div className="text-[11px]">
                  <span className="text-muted-foreground">Total</span>{" "}
                  <span className="font-semibold">{formatNaira(o.total)}</span>
                </div>
                <span className="text-[11px] text-gold font-semibold flex items-center gap-0.5">
                  Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </MobileShell>
  );
}
