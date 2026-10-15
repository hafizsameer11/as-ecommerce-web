import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Truck, Copy, Download, RotateCcw, MessageCircle } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { orderStatusStyle } from "@/components/account/ordersData";
import { useOrderById, useOrders } from "@/lib/orders-store";
import { accountApi, koboToNaira } from "@/lib/api/account";
import { useEffect, useState } from "react";
import { ReservationPanel, ReservationTimeline } from "@/components/account/ReservationPanel";
import { OrderProgressTimeline } from "@/components/account/OrderProgressTimeline";
import { fadeInUp } from "@/lib/motion";

export const Route = createFileRoute("/account/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} - ASL ORIGINALS` },
      { name: "description", content: "View full order details, items, tracking and receipts." },
      { property: "og:title", content: `Order ${params.id} - ASL ORIGINALS` },
      { property: "og:description", content: "View full order details, items, tracking and receipts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderDetail,
});

const NGN = new Intl.NumberFormat("en-NG");

function OrderDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const hydrate = useOrders((s) => s.hydrate);
  const stored = useOrderById(id);
  const [remote, setRemote] = useState<typeof stored>(undefined);
  const [loading, setLoading] = useState(!stored);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (stored) {
      setRemote(stored);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    accountApi
      .myOrder(id)
      .then((o) => {
        if (cancelled) return;
        const placed = o.date ? new Date(o.date) : new Date();
        setRemote({
          id: o.number || o.id,
          apiId: o.id,
          date: placed.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
          status: (o.status as any) || "Processing",
          total: koboToNaira(o.total),
          itemsCount: o.itemsCount,
          eta: o.eta ? new Date(o.eta).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : undefined,
          tracking: o.tracking ?? undefined,
          items: (o.items ?? []).map((i) => ({
            name: i.name,
            brand: i.brand ?? undefined,
            variant: i.variant,
            qty: i.qty,
            price: koboToNaira(i.price),
            image: i.image || "",
          })),
          subtotal: koboToNaira(o.subtotal),
          discount: koboToNaira(o.discount),
          couponCode: o.couponCode ?? null,
          shipping: koboToNaira(o.shipping),
          address: o.address
            ? {
                fullName: String(o.address.fullName || ""),
                address: String(o.address.address || o.address.line1 || ""),
                apartment: String(o.address.apartment || o.address.line2 || ""),
                city: String(o.address.city || ""),
                state: String(o.address.state || ""),
                postal: String(o.address.postal || o.address.postalCode || ""),
                country: String(o.address.country || "Nigeria"),
              }
            : null,
          contact: o.contact
            ? { email: o.contact.email || "", phone: o.contact.phone || "", subscribe: !!o.contact.subscribe }
            : null,
          delivery: (o.delivery as any) || "ship",
          payment: (o.payment as any) || "paystack",
          placedAt: placed.getTime(),
        });
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRemote(undefined);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, stored]);

  const order = stored ?? remote;

  if (loading) {
    return (
      <AccountInnerScaffold title="Order" subtitle="Loading…" activeId="orders" backTo="/account/orders" maxWidth="max-w-4xl">
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">Loading order…</div>
      </AccountInnerScaffold>
    );
  }

  if (!order) {
    return (
      <AccountInnerScaffold title="Order" subtitle="Not found" activeId="orders" backTo="/account/orders" maxWidth="max-w-4xl">
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
          We couldn’t find this order. It may belong to another account or no longer exist.
          <div className="mt-4">
            <Link to="/account/orders" className="inline-flex items-center justify-center bg-ink text-white text-[13px] font-semibold px-4 py-2.5 rounded-md">
              Back to orders
            </Link>
          </div>
        </div>
      </AccountInnerScaffold>
    );
  }

  const itemsSubtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotal: number = order.subtotal ?? itemsSubtotal;
  const shipping: number = order.shipping ?? 0;
  const discount: number = order.discount ?? 0;
  const total: number = order.total ?? subtotal + shipping - discount;
  const reservation = order.reservation;

  const paymentMethod = order.payment ?? "paystack";
  const delivery = order.delivery ?? "ship";
  const paymentLabels: Record<string, string> = {
    paystack: "Paystack - card / bank transfer",
    card: "Debit / credit card",
    bank: "Bank transfer",
  };
  const paymentLabel = paymentLabels[paymentMethod] ?? "Card payment";
  const addr = order.address;
  const addressLines: string[] = addr
    ? [
        addr.fullName,
        addr.address,
        addr.apartment,
        [addr.city, addr.state].filter(Boolean).join(", "),
        addr.postal,
        addr.country,
      ].filter((l): l is string => Boolean(l && l.trim()))
    : [];
  const contactPhone = order.contact?.phone ?? "";
  const contactEmail = order.contact?.email ?? "";


  return (
    <>
      <AccountInnerScaffold
        title={`Order ${order.id}`}
        subtitle={reservation ? `Reservation placed on ${order.date}` : `Placed on ${order.date}`}
        activeId="orders"
        backTo="/account/orders"
        maxWidth="max-w-4xl"
      >
        {/* Status header */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Status</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded ${orderStatusStyle[order.status]}`}>
                {reservation ? (reservation.balancePaid ? "Balance Paid" : "Awaiting Drop") : order.status}
              </span>
              {reservation ? (
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-gold/15 text-gold">Pre-order</span>
              ) : (
                order.eta && <span className="text-[13px] text-foreground/70">Expected Delivery: {order.eta}</span>
              )}
            </div>
          </div>
          {order.tracking && (
            <button
              onClick={() => { navigator.clipboard?.writeText(order.tracking!); toast("Tracking number copied"); }}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink hover:text-gold text-left"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
              <span>Tracking number: {order.tracking}</span>
            </button>
          )}
        </motion.div>

        {reservation && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <ReservationPanel order={order} />
          </motion.div>
        )}

        {/* Items */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Items ({order.itemsCount})</h2>
          <div className="space-y-4">
            {order.items.map((it, i) => (
              <div key={i} className="flex gap-3">
                <img src={it.image} alt={it.name} className="h-16 w-16 rounded-lg object-cover bg-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  {it.brand && <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{it.brand}</div>}
                  <div className="font-semibold text-[13px] truncate">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">{it.variant} · Qty {it.qty}</div>
                </div>
                <div className="text-[13px] font-semibold whitespace-nowrap">₦{NGN.format(it.price)}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">
            {reservation ? "Reservation Progress" : "Tracking"}
          </h2>
           {reservation ? <ReservationTimeline order={order} /> : <OrderProgressTimeline order={order} />}
        </motion.div>

        {/* Summary */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Payment Summary</h2>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{NGN.format(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-ink"><span>Discount</span><span>- ₦{NGN.format(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `₦${NGN.format(shipping)}`}</span></div>
            <div className="flex justify-between pt-2 border-t border-border font-bold"><span>{reservation ? "Paid today" : "Total"}</span><span>₦{NGN.format(total)}</span></div>
            {reservation && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">{reservation.balancePaid ? "Balance paid" : "Balance due on release"}</span><span className={reservation.balancePaid ? "text-ink" : "text-gold font-semibold"}>₦{NGN.format(reservation.balance)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-bold"><span>Order value</span><span>₦{NGN.format(reservation.retail)}</span></div>
              </>
            )}
          </div>
        </motion.div>

        {/* Payment details */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Payment Details</h2>

          <div className="space-y-4 text-[13px]">
            <div>
              <div className="font-semibold">Payment status</div>
              <div className="text-foreground/70">{order.status === "Cancelled" ? "Refunded" : "Paid"}</div>
            </div>

            <div>
              <div className="font-semibold">Payment type</div>
              <div className="text-foreground/70">{paymentLabel}</div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="font-semibold">Amount paid</div>
              <div className="font-semibold whitespace-nowrap">₦{NGN.format(total)}</div>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="font-semibold">{delivery === "pickup" ? "Pickup" : "Delivery address"}</div>
              {delivery === "pickup" ? (
                <div className="text-foreground/70">In-store pickup - ASL ORIGINALS, Lekki, Lagos.</div>
              ) : (
                <div className="text-foreground/70 leading-relaxed">
                  {addressLines.map((l) => (
                    <div key={l}>{l}</div>
                  ))}
                </div>
              )}
              {contactPhone && <div className="text-foreground/70 mt-2">Mobile: {contactPhone}</div>}
              {contactEmail && <div className="text-foreground/70">Email: {contactEmail}</div>}
            </div>
          </div>
        </motion.div>


        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to="/account/track" search={{ id: order.id } as any} className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-ink/90">
            <Truck className="h-4 w-4" /> Track
          </Link>
          <button onClick={() => toast("Invoice downloading…")} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
            <Download className="h-4 w-4" /> Invoice
          </button>
          {!reservation && <button onClick={() => nav({ to: "/account/returns" })} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> Return
          </button>}
          <button onClick={() => nav({ to: "/account/help/contact" })} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
            <MessageCircle className="h-4 w-4" /> Support
          </button>
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
