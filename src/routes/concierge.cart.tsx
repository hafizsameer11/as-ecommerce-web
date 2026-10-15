import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Trash2, Minus, Plus, ShieldCheck, HelpCircle, Info, ArrowLeft, ShoppingBag, RefreshCw, BadgeCheck, Truck, User } from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { toast, Toaster } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import {
  conciergeStatusStyle, naira,
} from "@/components/concierge-checkout/conciergeCheckoutData";
import { useConciergeCheckoutState } from "@/components/concierge-checkout/useConciergeCheckout";

export const Route = createFileRoute("/concierge/cart")({
  head: () => ({ meta: [{ title: "Concierge Cart - ASL ORIGINALS" }] }),
  component: ConciergeCartPage,
});

const featureRow = [
  { Icon: ShoppingBag, t: "Fashion Concierge Service", d: "We source your items from trusted retailers and deliver to your doorstep." },
  { Icon: BadgeCheck, t: "100% Authentic", d: "Sourced from trusted retailers" },
  { Icon: User, t: "Personal Shopper", d: "We handle the search for you" },
  { Icon: Truck, t: "Global Sourcing", d: "Access hard-to-find items" },
];

const footerBadges = [
  { Icon: RefreshCw, t: "How it works", d: "We source, purchase and deliver to you." },
  { Icon: Truck, t: "Estimated Delivery", d: "7 - 14 working days from purchase." },
  { Icon: StrokeRosetteCheckIcon, t: "Authenticity Guaranteed", d: "All items are 100% authentic or your money back." },
  { Icon: User, t: "Dedicated Concierge", d: "Personal support from our expert team." },
];

function ConciergeCartPage() {
  const nav = useNavigate();
  const { items: conciergeItems, summary } = useConciergeCheckoutState();
  const CONCIERGE_SERVICE_FEE = summary.serviceFee;
  const CONCIERGE_SHIPPING_EST = summary.shippingEstimate;
  const conciergeSubtotal = () => summary.subtotal;
  const conciergeTotal = () => summary.estimatedTotal;
  return (
    <AccountInnerScaffold title="Shopping Cart" subtitle="Review your concierge items and proceed to request." activeId="requests">
      {/* Feature banner */}
      <div className="rounded-lg bg-[#faf5eb] border border-amber-100/60 p-4 md:p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
        {featureRow.map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-full bg-amber-100/70 shrink-0">
              <Icon className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-4">
          <h2 className="font-display text-xl font-bold">Your Concierge Items ({conciergeItems.length})</h2>

          {/* Desktop table header */}
          <div className="hidden md:grid grid-cols-[80px_1.5fr_1.2fr_120px_130px_120px_32px] gap-3 text-[11px] font-semibold uppercase text-muted-foreground border-b border-border pb-2">
            <div />
            <div>Item</div>
            <div>Details</div>
            <div>Est. Price</div>
            <div>Qty</div>
            <div className="text-right">Total</div>
            <div />
          </div>

          {conciergeItems.map((i) => (
            <div key={i.id} className="border border-border rounded-lg p-3 bg-card md:border-0 md:rounded-none md:bg-transparent md:p-0">
              <div className="grid grid-cols-[80px_1fr] gap-3 md:grid-cols-[80px_1.5fr_1.2fr_120px_130px_120px_32px] md:items-center md:py-4 md:border-b md:border-border">
                <img src={i.image} alt={i.name} className="h-20 w-20 rounded-md object-cover bg-muted" />
                <div className="min-w-0">
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{i.brand}</div>
                  <div className="text-[13px] font-semibold leading-tight">{i.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-1">
                    {i.size && <>Size: {i.size} &nbsp;|&nbsp; </>}Condition: {i.condition}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Source: {i.source}</div>
                  <span className={`md:hidden inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded ${conciergeStatusStyle[i.status]}`}>
                    {i.status}
                  </span>
                </div>
                <div className="hidden md:block">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${conciergeStatusStyle[i.status]}`}>
                    {i.status}
                  </span>
                  <div className="text-[11px] text-muted-foreground mt-1 max-w-[180px] leading-snug">{i.statusNote}</div>
                </div>
                <div className="hidden md:block text-[13px] font-semibold">{naira(i.price)}</div>
                <div className="col-span-2 md:col-span-1 flex items-center gap-3 mt-2 md:mt-0">
                  <div className="inline-flex items-center border border-border rounded opacity-50 pointer-events-none" aria-hidden>
                    <span className="p-1.5"><Minus className="h-3 w-3" /></span>
                    <span className="px-3 text-[13px] font-semibold">{i.qty}</span>
                    <span className="p-1.5"><Plus className="h-3 w-3" /></span>
                  </div>
                  <div className="md:hidden ml-auto text-[13px] font-semibold">{naira(i.price)}</div>
                </div>
                <div className="hidden md:block text-right text-[13px] font-semibold">{naira(i.price * i.qty)}</div>
                <button onClick={() => toast("Removed")} className="hidden md:block text-muted-foreground hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Link to="/concierge-categories" className="inline-flex items-center gap-2 border border-border rounded-md px-4 py-2.5 text-[13px] font-semibold hover:bg-muted">
              <ArrowLeft className="h-4 w-4" /> Continue Shopping
            </Link>
            <button onClick={() => toast("Cart cleared")} className="inline-flex items-center gap-2 border border-border rounded-md px-4 py-2.5 text-[13px] font-semibold hover:bg-muted">
              <Trash2 className="h-4 w-4" /> Clear Cart
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="space-y-4">
          <div className="border border-border rounded-lg p-5 bg-card space-y-4">
            <h3 className="font-display font-bold text-lg">Order Summary</h3>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({conciergeItems.length} items)</span><span className="font-medium">{naira(conciergeSubtotal())}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1">Concierge Service Fee <Info className="h-3 w-3" /></span><span className="font-medium">{naira(CONCIERGE_SERVICE_FEE)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1">Shipping (Est.) <Info className="h-3 w-3" /></span><span className="font-medium">{naira(CONCIERGE_SHIPPING_EST)}</span></div>
            </div>
            <div className="border-t border-border pt-3">
              <div className="text-[13px] text-muted-foreground">Estimated Total</div>
              <div className="font-semibold text-2xl mt-1">{naira(conciergeTotal())}</div>
              <div className="text-[11px] text-muted-foreground">You will pay in NGN.</div>
            </div>
            <button onClick={() => nav({ to: "/concierge/payment" })} className="w-full bg-ink text-white py-3 rounded-md text-sm font-semibold hover:opacity-90">
              Proceed to Request
            </button>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card flex gap-3">
            <ShieldCheck className="h-5 w-5 text-ink shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-semibold">Secure & Trusted</div>
              <div className="text-[11px] text-muted-foreground">Your payment is secure and your items are 100% authentic.</div>
            </div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card flex gap-3">
            <HelpCircle className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-semibold">Need help?</div>
              <div className="text-[11px] text-muted-foreground">Our concierge team is here to help you every step of the way.</div>
              <Link to="/account/help/contact" className="text-[12px] font-semibold text-amber-700 underline mt-1 inline-block">Contact Concierge</Link>
            </div>
          </div>
        </aside>
      </div>

      <div className="rounded-lg bg-[#faf5eb] border border-amber-100/60 p-4 md:p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {footerBadges.map(({ Icon, t, d }) => (
          <div key={t} className="flex gap-3">
            <div className="h-9 w-9 grid place-items-center rounded-full bg-amber-100/70 shrink-0">
              <Icon className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <div className="text-[13px] font-semibold">{t}</div>
              <div className="text-[11px] text-muted-foreground leading-snug">{d}</div>
            </div>
          </div>
        ))}
      </div>
      <Toaster position="top-center" />
    </AccountInnerScaffold>
  );
}
