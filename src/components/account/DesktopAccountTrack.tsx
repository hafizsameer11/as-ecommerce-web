import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, MessageCircle, Search } from "lucide-react";
import { toast } from "sonner";
import { getRouteApi } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { fadeInUp, buttonTap } from "@/lib/motion";
import { orderStatusStyle } from "./ordersData";
import { useOrders, type PlacedOrder } from "@/lib/orders-store";
import { ReservationPanel, ReservationTimeline } from "@/components/account/ReservationPanel";
import { OrderProgressTimeline } from "./OrderProgressTimeline";

const routeApi = getRouteApi("/account/track");

const NGN = new Intl.NumberFormat("en-NG");

export function DesktopAccountTrack() {
  const search = routeApi.useSearch();
  const [id, setId] = useState(search.id ?? "");
  const [lookupId, setLookupId] = useState(search.id ?? "");
  useEffect(() => { setId(search.id ?? ""); setLookupId(search.id ?? ""); }, [search.id]);
  const foundOrder = useOrders((s) => lookupId ? s.orders.find((o) => o.id.toLowerCase() === lookupId.toLowerCase()) : s.orders[0]);

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="track" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-3xl font-bold">Track Order</h1>
             <p className="text-sm text-muted-foreground mt-1">Enter an order ID to see its status.</p>
          </motion.div>

          <div className="rounded-lg border border-border bg-card p-5">
             <label className="text-[11px] text-muted-foreground">Enter your Order ID</label>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 flex items-center border border-border rounded bg-background focus-within:border-ink">
                <Search className="h-4 w-4 mx-3 text-muted-foreground" />
                <input
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") setLookupId(id.trim()); }}
                   placeholder="e.g. ASL-ORD-10248"
                  className="flex-1 bg-transparent px-1 py-3 text-[13px] outline-none placeholder:text-muted-foreground/60"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
                onClick={() => { setLookupId(id.trim()); if (id.trim()) toast.success(`Looking up ${id.trim()}`); }}
                className="bg-ink text-white px-6 py-3 text-[13px] font-semibold rounded shrink-0"
              >
                Track
              </motion.button>
            </div>
            {lookupId && !foundOrder && (
              <div className="mt-3 text-[12px] text-muted-foreground">
                 No order found for <span className="font-semibold text-foreground">{lookupId}</span>. Check the order ID and try again.
              </div>
            )}
          </div>

           {foundOrder && <OrderTrackingCard order={foundOrder} />}

          <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-100 grid place-items-center shrink-0">
              <Bell className="h-4 w-4 text-amber-700" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[13px] font-semibold">You will receive an update at each stage.</div>
              <p className="text-[12px] text-muted-foreground mt-0.5">We'll email and message you as your order moves along.</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-[14px] font-semibold">Need help?</div>
              <p className="text-[12px] text-muted-foreground mt-0.5">Our concierge team is here to assist you.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
              onClick={() => toast("Contacting concierge…")}
              className="inline-flex items-center gap-2 bg-ink text-white px-5 py-3 text-[13px] font-semibold rounded shrink-0"
            >
              <MessageCircle className="h-4 w-4" /> Contact Concierge
            </motion.button>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}

function OrderTrackingCard({ order }: { order: PlacedOrder }) {
  const reservation = order.reservation;
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Order</div>
          <div className="font-semibold text-[18px]">{order.id}</div>
          <div className="text-[12px] text-muted-foreground mt-1">Placed {order.date} · {order.itemsCount} item(s)</div>
        </div>
        <div className="text-right">
          <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded ${reservation ? "bg-gold/15 text-gold" : orderStatusStyle[order.status]}`}>
            {reservation ? (reservation.balancePaid ? "Balance Paid" : "Pre-order") : order.status}
          </span>
          {!reservation && order.eta && <div className="text-[12px] text-muted-foreground mt-2">Expected Delivery: {order.eta}</div>}
          {!reservation && order.tracking && <div className="text-[12px] mt-1"><span className="text-muted-foreground">Tracking number:</span> <span className="font-semibold">{order.tracking}</span></div>}
        </div>
      </div>

      <div className="mt-6 divide-y divide-border">
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <img src={it.image} alt={it.name} className="h-12 w-12 rounded-md object-cover bg-muted" />
            <div className="flex-1 min-w-0">
              {it.brand && <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground leading-tight">{it.brand}</div>}
              <div className="text-[13px] font-medium">{it.name}</div>
              <div className="text-[11px] text-muted-foreground">{it.variant} · Qty {it.qty}</div>
            </div>
            <div className="text-[13px] font-semibold">₦{NGN.format(it.price * it.qty)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-[13px] max-w-[320px] ml-auto">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">₦{NGN.format(order.subtotal)}</span></div>
        {order.discount > 0 && (
          <div className="flex justify-between"><span className="text-muted-foreground">Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span><span className="font-medium">-₦{NGN.format(order.discount)}</span></div>
        )}
        <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{order.shipping === 0 ? "Free" : `₦${NGN.format(order.shipping)}`}</span></div>
        <div className="flex justify-between pt-1.5 border-t border-border text-[14px]"><span className="font-semibold">Total</span><span className="font-bold">₦{NGN.format(order.total)}</span></div>
      </div>

      {reservation && (
        <div className="mt-6">
          <ReservationPanel order={order} />
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-[13px] font-bold uppercase tracking-widest mb-6">{reservation ? "Reservation Progress" : "Tracking"}</div>
        {reservation ? <ReservationTimeline order={order} /> : <OrderProgressTimeline order={order} />}
      </div>
    </div>
  );
}

