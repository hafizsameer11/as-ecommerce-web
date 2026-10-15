import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Truck, Copy, Download, RotateCcw, MessageCircle, XCircle, CreditCard, RefreshCw } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { orderStatusStyle } from "@/components/account/ordersData";
import { useOrderById, useOrders } from "@/lib/orders-store";
import { accountApi } from "@/lib/api/account";
import { useEffect, useState } from "react";
import { ReservationPanel, ReservationTimeline } from "@/components/account/ReservationPanel";
import { OrderProgressTimeline } from "@/components/account/OrderProgressTimeline";
import { fadeInUp } from "@/lib/motion";
import { formatPaymentStatusLabel } from "@/lib/public-settings-format";
import { downloadOrderInvoice, payOrderAgain } from "@/lib/order-actions";

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
  const hydrateOrder = useOrders((s) => s.hydrateOrder);
  const order = useOrderById(id);
  const [loading, setLoading] = useState(!order);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    let cancelled = false;
    setLoading(!order);
    void hydrateOrder(id).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id, hydrateOrder, order]);

  const current = useOrderById(id) ?? order;

  if (loading && !current) {
    return (
      <AccountInnerScaffold title="Order" subtitle="Loading…" activeId="orders" backTo="/account/orders" maxWidth="max-w-4xl">
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">Loading order…</div>
      </AccountInnerScaffold>
    );
  }

  if (!current) {
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

  const orderRow = current;
  const apiId = orderRow.apiId ?? id;
  const itemsSubtotal = orderRow.items.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotal: number = orderRow.subtotal ?? itemsSubtotal;
  const shipping: number = orderRow.shipping ?? 0;
  const discount: number = orderRow.discount ?? 0;
  const total: number = orderRow.total ?? subtotal + shipping - discount;
  const reservation = orderRow.reservation;
  const amountPaid = orderRow.amountPaid ?? (orderRow.paymentStatus?.toLowerCase() === "paid" ? total : 0);
  const paymentStatusLabel = formatPaymentStatusLabel(orderRow.paymentStatus, orderRow.status);

  const paymentMethod = orderRow.payment ?? "paystack";
  const delivery = orderRow.delivery ?? "ship";
  const paymentLabels: Record<string, string> = {
    paystack: "Paystack - card / bank transfer",
    card: "Debit / credit card",
    bank: "Bank transfer",
    wallet: "ASL Wallet",
    bank_transfer: "Bank transfer",
  };
  const paymentLabel = paymentLabels[paymentMethod] ?? "Card payment";
  const addr = orderRow.address;
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
  const contactPhone = orderRow.contact?.phone ?? "";
  const contactEmail = orderRow.contact?.email ?? "";

  const refresh = () => void hydrateOrder(id);

  const onCancel = async () => {
    if (busy) return;
    setBusy("cancel");
    try {
      await accountApi.cancelOrder(apiId);
      toast.success("Order cancelled");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel order");
    } finally {
      setBusy(null);
    }
  };

  const onPay = async () => {
    if (busy) return;
    setBusy("pay");
    try {
      await payOrderAgain(apiId, `/account/orders/${orderRow.id}`);
      toast.success("Payment updated");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setBusy(null);
    }
  };

  const onReorder = async () => {
    if (busy) return;
    setBusy("reorder");
    try {
      await accountApi.reorder(apiId);
      toast.success("Items added to your bag");
      nav({ to: "/cart" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reorder");
    } finally {
      setBusy(null);
    }
  };

  const onInvoice = async () => {
    if (busy) return;
    setBusy("invoice");
    try {
      await downloadOrderInvoice(apiId, `invoice-${orderRow.id}.pdf`);
      toast.success("Invoice downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not download invoice");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title={`Order ${orderRow.id}`}
        subtitle={reservation ? `Reservation placed on ${orderRow.date}` : `Placed on ${orderRow.date}`}
        activeId="orders"
        backTo="/account/orders"
        maxWidth="max-w-4xl"
      >
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Status</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded ${orderStatusStyle[orderRow.status]}`}>
                {reservation ? (reservation.balancePaid ? "Balance Paid" : "Awaiting Drop") : orderRow.status}
              </span>
              {reservation ? (
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-gold/15 text-gold">Pre-order</span>
              ) : (
                orderRow.eta && <span className="text-[13px] text-foreground/70">Expected Delivery: {orderRow.eta}</span>
              )}
            </div>
          </div>
          {orderRow.tracking && (
            <button
              onClick={() => {
                navigator.clipboard?.writeText(orderRow.tracking!);
                toast("Tracking number copied");
              }}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink hover:text-gold text-left"
            >
              <Copy className="h-3.5 w-3.5 shrink-0" />
              <span>Tracking number: {orderRow.tracking}</span>
            </button>
          )}
        </motion.div>

        {reservation && (
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <ReservationPanel order={orderRow} />
          </motion.div>
        )}

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Items ({orderRow.itemsCount})</h2>
          <div className="space-y-4">
            {orderRow.items.map((it, i) => (
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

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">
            {reservation ? "Reservation Progress" : "Tracking"}
          </h2>
          {reservation ? <ReservationTimeline order={orderRow} /> : <OrderProgressTimeline order={orderRow} />}
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Payment Summary</h2>
          <div className="space-y-2 text-[13px]">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₦{NGN.format(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-ink"><span>Discount</span><span>- ₦{NGN.format(discount)}</span></div>}
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : `₦${NGN.format(shipping)}`}</span></div>
            <div className="flex justify-between pt-2 border-t border-border font-bold"><span>{reservation ? "Paid today" : "Total"}</span><span>₦{NGN.format(total)}</span></div>
            {orderRow.due != null && orderRow.due > 0 && (
              <div className="flex justify-between text-gold font-semibold"><span>Amount due</span><span>₦{NGN.format(orderRow.due)}</span></div>
            )}
            {reservation && (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">{reservation.balancePaid ? "Balance paid" : "Balance due on release"}</span><span className={reservation.balancePaid ? "text-ink" : "text-gold font-semibold"}>₦{NGN.format(reservation.balance)}</span></div>
                <div className="flex justify-between pt-2 border-t border-border font-bold"><span>Order value</span><span>₦{NGN.format(reservation.retail)}</span></div>
              </>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-4">Payment Details</h2>
          <div className="space-y-4 text-[13px]">
            <div>
              <div className="font-semibold">Payment status</div>
              <div className="text-foreground/70">{paymentStatusLabel}</div>
            </div>
            <div>
              <div className="font-semibold">Payment type</div>
              <div className="text-foreground/70">{paymentLabel}</div>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="font-semibold">Amount paid</div>
              <div className="font-semibold whitespace-nowrap">₦{NGN.format(amountPaid)}</div>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="font-semibold">{delivery === "pickup" ? "Pickup" : "Delivery address"}</div>
              {delivery === "pickup" ? (
                <div className="text-foreground/70">In-store pickup — see order confirmation for location details.</div>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to="/account/track" search={{ id: orderRow.id } as any} className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-ink/90">
            <Truck className="h-4 w-4" /> Track
          </Link>
          <button type="button" disabled={!!busy} onClick={() => void onInvoice()} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted disabled:opacity-60">
            <Download className="h-4 w-4" /> Invoice
          </button>
          {orderRow.canPay && (
            <button type="button" disabled={!!busy} onClick={() => void onPay()} className="inline-flex items-center justify-center gap-2 border border-gold bg-gold/10 text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-gold/20 disabled:opacity-60">
              <CreditCard className="h-4 w-4" /> Pay again
            </button>
          )}
          {orderRow.canCancel && (
            <button type="button" disabled={!!busy} onClick={() => void onCancel()} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted disabled:opacity-60">
              <XCircle className="h-4 w-4" /> Cancel
            </button>
          )}
          {!reservation && (
            <button type="button" disabled={!!busy} onClick={() => void onReorder()} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted disabled:opacity-60">
              <RefreshCw className="h-4 w-4" /> Buy again
            </button>
          )}
          {!reservation && orderRow.canReturn && (
            <Link to="/account/returns/start" search={{ orderId: apiId } as any} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
              <RotateCcw className="h-4 w-4" /> Return
            </Link>
          )}
          {!reservation && !orderRow.canReturn && (
            <button type="button" onClick={() => nav({ to: "/account/returns" })} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
              <RotateCcw className="h-4 w-4" /> Return
            </button>
          )}
          <button type="button" onClick={() => nav({ to: "/account/help/contact" })} className="inline-flex items-center justify-center gap-2 border border-border bg-white text-[13px] font-semibold px-4 py-2.5 rounded-md hover:bg-muted">
            <MessageCircle className="h-4 w-4" /> Support
          </button>
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
