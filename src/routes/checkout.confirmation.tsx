import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { CheckCircle2, Copy, Calendar, CreditCard, Wallet, ShoppingBag, Package, Truck, Headphones, Crown, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { naira } from "@/components/checkout/checkoutData";
import { useOrderById, useOrders } from "@/lib/orders-store";
import wordmarkBlack from "@/assets/ASL_wordmark_black.png";

const searchSchema = z.object({
  id: fallback(z.string(), "").default(""),
  reference: fallback(z.string(), "").default(""),
  status: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/checkout/confirmation")({
  head: () => ({ meta: [{ title: "Order Confirmed - ASL ORIGINALS" }] }),
  validateSearch: zodValidator(searchSchema),
  component: ConfirmationPage,
});

const upsell = [
  { name: "Air Jordan 4 Retro 'Black Cat' 2025", price: 620000, image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=300&q=80" },
  { name: "Vale Forever Angry Bee Jacket Black", price: 195000, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=300&q=80" },
  { name: "AMIRI MA Quad Pool Slides Red", price: 195000, image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=300&q=80" },
  { name: "G-SHOCK GA-2100 B2100-1AER", price: 210000, image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=300&q=80" },
  { name: "Creed Aventus Eau De Parfum", price: 580000, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=300&q=80" },
  { name: "Louis Vuitton Keepall Bandoulière 45", price: 1250000, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80" },
];

const steps = [
  { Icon: CheckCircle2, label: "Complete", sub: "We've received your order.", done: true },
  { Icon: Package, label: "Processing", sub: "We are preparing your items." },
  { Icon: Truck, label: "On Its Way", sub: "Your order is on the way." },
  { Icon: ShoppingBag, label: "Delivered", sub: "Enjoy your purchase!" },
];

function ConfirmationPage() {
  const [summaryOpen, setSummaryOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { id } = Route.useSearch();
  const orderFromStore = useOrderById(id);
  const latest = useOrders((s) => s.orders[0]);
  const order = (id && orderFromStore) || latest || orderFromStore;

  if (!order) {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <div className="font-display text-2xl font-bold">No order found</div>
          <p className="text-sm text-muted-foreground mt-1">We couldn't find that order.</p>
          <Link to="/shop" className="inline-block mt-4 bg-ink text-white text-[13px] font-semibold px-5 py-3 rounded-md">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const paymentLabel: Record<string, string> = { paystack: "Pay with Paystack", bank: "Bank Transfer", card: "Pay with Card" };
  const { subtotal, discount, shipping, total } = order;

  const Body = (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-4 md:py-7">
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-ink grid place-items-center">
              <CheckCircle2 className="h-7 w-7 text-white" strokeWidth={2} />
            </div>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-ink" />
              Complete
            </div>
            <h1 className="mt-2 font-display text-xl md:text-2xl font-bold">Thank You, Your Order is Complete!</h1>
            <p className="text-[13px] text-muted-foreground mt-2 max-w-md mx-auto">
              We've received your order and it's now being processed. You will receive an email confirmation shortly.
            </p>
          </div>

          <div className="rounded-md bg-ink border border-ink px-4 py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-white/70 text-center">Order Number</div>
              <div className="font-display font-bold text-lg text-white tracking-wider">{order.id}</div>
            </div>
            <button onClick={() => { navigator.clipboard?.writeText(order.id); toast("Order number copied"); }} className="text-white hover:opacity-80">
              <Copy className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Order Date</div>
                <div className="text-[13px] font-medium">{order.date}</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
              <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Payment Method</div>
                <div className="text-[13px] font-medium">{paymentLabel[order.payment]}</div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-md border border-border bg-card">
              <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Total Paid</div>
                <div className="text-[13px] font-semibold text-ink">{naira(total)}</div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-md p-3.5 bg-card">
            <div className="text-center font-display font-bold text-base">What Happens Next?</div>
            <div className="mt-4 grid grid-cols-4 gap-2 relative">
              {steps.map((s, i) => (
                <div key={s.label} className="flex flex-col items-center text-center relative">
                  <div className={`h-11 w-11 rounded-full grid place-items-center ${s.done ? "bg-ink text-white" : "bg-muted text-muted-foreground"} z-10`}>
                    <s.Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className={`text-[11px] font-semibold mt-2 ${s.done ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight px-1 hidden md:block">{s.sub}</div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-5 left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px border-t border-dashed border-border" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
              <button onClick={() => navigate({ to: "/shop" })} className="bg-ink text-white py-3 rounded-md text-sm font-semibold">Continue Shopping</button>
              <button onClick={() => navigate({ to: "/account/orders/$id", params: { id: order.id } })} className="border border-border py-3 rounded-md text-sm font-semibold hover:bg-muted">View Order</button>
              <button onClick={() => navigate({ to: "/account/track", search: { id: order.id } as any })} className="border border-border py-3 rounded-md text-sm font-semibold hover:bg-muted">Track Order</button>
            </div>
          </div>

          <div className="border border-border bg-muted/40 rounded-md p-3 flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-gold/20 grid place-items-center shrink-0"><Crown className="h-5 w-5 text-gold" /></div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">You're earning points!</div>
              <div className="text-[12px] text-muted-foreground">This order will earn you {Math.round(total / 100)} points as an ASL Club Gold Member.</div>
            </div>
            <Link to="/account/benefits" className="text-[12px] font-semibold underline flex items-center gap-1">View Benefits <ChevronRight className="h-3 w-3" /></Link>
          </div>

          <div className="border border-border rounded-md p-3 flex items-center gap-2.5 bg-card">
            <div className="h-10 w-10 rounded-full bg-muted grid place-items-center shrink-0"><Headphones className="h-5 w-5" /></div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold">Need Help?</div>
              <div className="text-[12px] text-muted-foreground">Our customer care team is here for you.</div>
            </div>
            <Link to="/account/help/contact" className="text-[12px] font-semibold underline">Contact Support</Link>
          </div>

        </div>

        <aside className="min-w-0">
          <div className="bg-muted/40 border border-border rounded-md p-3 space-y-3">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSummaryOpen((v) => !v)}
                aria-expanded={summaryOpen}
                className="flex items-center gap-1.5 font-semibold text-[13px] text-left"
              >
                Order Summary ({order.itemsCount} items)
                <ChevronDown className={`h-4 w-4 transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
              </button>
              <Link to="/account/orders/$id" params={{ id: order.id }} className="text-[12px] font-semibold underline">View Details</Link>
            </div>
            {summaryOpen && (
              <div className="divide-y divide-border">
                {order.items.map((l: { image: string; name: string; brand?: string; variant: string; qty: number; price: number }, i: number) => (
                  <div key={i} className="flex gap-3 py-3">
                    <img src={l.image} alt={l.name} className="h-14 w-14 rounded-md object-cover bg-muted shrink-0" />
                    <div className="flex-1 min-w-0 pr-1">
                      {l.brand && <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{l.brand}</div>}
                      <div className="text-[13px] font-medium leading-snug">{l.name}</div>
                      <div className="text-[12px] text-muted-foreground">{l.variant}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Qty: {l.qty}</div>
                    </div>
                    <div className="text-[13px] font-semibold whitespace-nowrap">{naira(l.price * l.qty)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 pt-1 border-t border-border text-[13px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{naira(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-ink font-bold"><span>Discount ({order.couponCode})</span><span className="font-bold">- {naira(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{shipping === 0 ? "Free" : naira(shipping)}</span></div>
              <div className="flex justify-between items-baseline pt-3 border-t border-border">
                <span className="font-sans font-bold text-[15px]">Total</span>
                <span className="font-semibold text-base">{naira(total)}</span>
              </div>
            </div>
            {order.tracking && (
              <div className="border border-border rounded-md p-3 text-[12px]">
                <span className="text-muted-foreground">Tracking: </span><span className="font-semibold">{order.tracking}</span>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-10">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display font-bold text-lg">You May Also Like</h2>
          <Link to="/shop" className="text-[12px] font-semibold underline">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {upsell.map((p) => (
            <Link key={p.name} to="/shop" className="group">
              <div className="aspect-square bg-muted rounded-md overflow-hidden">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
              <div className="mt-2 text-[12px] font-medium line-clamp-2">{p.name}</div>
              <div className="text-[13px] font-semibold">{naira(p.price)}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <DesktopShell active="Cart">{Body}</DesktopShell>
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5">
          <button onClick={() => navigate({ to: "/shop" })} aria-label="Back" className="text-foreground">
            <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
          </button>
          <div className="flex justify-center">
            <img src={wordmarkBlack} alt="ASL ORIGINALS" className="h-[15px] w-auto object-contain" />
          </div>
          <button onClick={() => navigate({ to: "/cart" })} aria-label="Cart" className="relative">
            <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
      {Body}
      <Toaster position="top-center" />
    </div>
  );
}
