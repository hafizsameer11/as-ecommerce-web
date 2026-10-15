import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { getRouteApi } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { orderStatusStyle } from "./ordersData";
import { buttonTap } from "@/lib/motion";
import { useOrders, type PlacedOrder } from "@/lib/orders-store";
import { ReservationPanel, ReservationTimeline } from "@/components/account/ReservationPanel";
import { OrderProgressTimeline } from "./OrderProgressTimeline";

const routeApi = getRouteApi("/account/track");
const NGN = new Intl.NumberFormat("en-NG");

export function MobileAccountTrack() {
  const search = routeApi.useSearch();
  const [id, setId] = useState(search.id ?? "");
  const [lookupId, setLookupId] = useState(search.id ?? "");
  useEffect(() => { setId(search.id ?? ""); setLookupId(search.id ?? ""); }, [search.id]);
  const foundOrder = useOrders((s) => lookupId ? s.orders.find((o) => o.id.toLowerCase() === lookupId.toLowerCase()) : s.orders[0]);

  return (
    <MobileShell
      activeBottom="account"
      headerVariant="account"
      showTopTabs={false}
    >
      <div className="sticky top-[52px] z-20 flex items-center justify-between border-b border-border bg-background px-3 py-3">
        <button onClick={() => history.back()} aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display text-[15px] font-bold">Track Your Order</h1>
        <div className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="space-y-3 px-3 py-3 pb-6">
        <section className="overflow-hidden rounded-lg bg-ink text-paper">
          <div className="px-4 pb-3 pt-4">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-paper/55">Order tracking</div>
            <h2 className="mt-1 font-display text-lg font-bold">Where is your order?</h2>
             <p className="mt-1 text-[11px] leading-relaxed text-paper/65">Track your order from placement to delivery.</p>
          </div>
          <div className="flex items-center gap-2 border-t border-paper/15 p-2">
            <div className="flex flex-1 items-center rounded-md bg-background text-foreground focus-within:ring-1 focus-within:ring-ring">
              <Search className="mx-2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setLookupId(id.trim()); }}
               placeholder="Order ID"
                 aria-label="Order ID"
                className="min-w-0 flex-1 bg-transparent py-2.5 pr-2 text-[11px] outline-none placeholder:text-muted-foreground/70"
            />
          </div>
          <motion.button
            whileTap="tap" variants={buttonTap}
              onClick={() => setLookupId(id.trim())}
              className="shrink-0 rounded-md bg-background px-4 py-2.5 text-[11px] font-bold text-foreground"
          >
            Track
          </motion.button>
          </div>
        </section>

        <div className="flex items-center justify-between px-0.5 pt-1">
          <h2 className="font-display text-[11px] font-bold uppercase tracking-widest">Tracking details</h2>
           <span className="text-[10px] text-muted-foreground">Orders</span>
        </div>

        {lookupId && !foundOrder && (
          <div className="border-l-2 border-foreground bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
             No order found for <span className="font-semibold text-foreground">{lookupId}</span>. Check the order ID and try again.
          </div>
        )}

         {foundOrder && <MobileOrderCard order={foundOrder} />}

        <button
          onClick={() => toast("Contacting concierge…")}
          className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper">
            <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold">Need help?</div>
            <div className="text-[11px] text-muted-foreground">Contact our concierge team</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </MobileShell>
  );
}

function MobileOrderCard({ order }: { order: PlacedOrder }) {
  const reservation = order.reservation;
  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="h-1 bg-ink" />
        <div className="p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">{order.id}</div>
            <div className="text-[11px] text-muted-foreground">Placed {order.date} · {order.itemsCount} item(s)</div>
          </div>
          <span className={`shrink-0 text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${reservation ? "bg-gold/15 text-gold" : orderStatusStyle[order.status]}`}>
            {reservation ? (reservation.balancePaid ? "Balance Paid" : "Pre-order") : order.status}
          </span>
        </div>
        {!reservation && (order.eta || order.tracking) && (
          <div className="mt-2 pt-2 border-t border-border text-[11px] text-muted-foreground">
            {order.eta && <>Expected Delivery: <span className="text-foreground font-medium">{order.eta}</span></>}
            {order.tracking && <> · Tracking number: <span className="text-foreground font-medium">{order.tracking}</span></>}
          </div>
        )}
        <div className="mt-3 divide-y divide-border">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <img src={it.image} alt={it.name} className="h-10 w-10 rounded-md object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                {it.brand && <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{it.brand}</div>}
                <div className="text-[12px] font-medium leading-tight">{it.name}</div>
                <div className="text-[10px] text-muted-foreground">{it.variant} · Qty {it.qty}</div>
              </div>
              <div className="text-[12px] font-semibold shrink-0">₦{NGN.format(it.price * it.qty)}</div>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-border space-y-1 text-[11px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₦{NGN.format(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between"><span className="text-muted-foreground">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className="font-medium">-₦{NGN.format(order.discount)}</span></div>
          )}
          <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{order.shipping === 0 ? "Free" : `₦${NGN.format(order.shipping)}`}</span></div>
          <div className="flex justify-between pt-1 border-t border-border text-[12px]"><span className="font-semibold">Total</span><span className="font-bold">₦{NGN.format(order.total)}</span></div>
        </div>
        </div>
      </div>

      {reservation && <ReservationPanel order={order} />}

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[13px] font-semibold uppercase tracking-widest">{reservation ? "Reservation Progress" : "Tracking"}</div>
        </div>
        {reservation ? <ReservationTimeline order={order} /> : <OrderProgressTimeline order={order} />}
      </div>
    </>
  );
}

