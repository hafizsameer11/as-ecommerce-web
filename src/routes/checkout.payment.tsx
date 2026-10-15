import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { CreditCard, Building2, Truck, ArrowRight, ArrowLeft, Tag, X, Lock, CircleCheck } from "lucide-react";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { naira } from "@/components/checkout/checkoutData";
import { useCheckout, shippingFor } from "@/lib/checkout-store";
import { useCartSubtotal } from "@/lib/cart-store";
import { useMyCoupons } from "@/lib/my-coupons-store";
import { paymentBrands } from "@/components/checkout/PaymentBrandLogos";


export const Route = createFileRoute("/checkout/payment")({
  head: () => ({ meta: [{ title: "Checkout: Payment - ASL ORIGINALS" }] }),
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const pay = useCheckout((s) => s.payment);
  const setPay = useCheckout((s) => s.setPayment);
  const couponCode = useCheckout((s) => s.coupon);
  const discountPct = useCheckout((s) => s.discountPct);
  const discountAmount = useCheckout((s) => s.discountAmount);
  const applyCoupon = useCheckout((s) => s.applyCoupon);
  const removeCoupon = useCheckout((s) => s.removeCoupon);
  const syncSession = useCheckout((s) => s.syncSession);
  const delivery = useCheckout((s) => s.delivery);
  const address = useCheckout((s) => s.address);

  const subtotal = useCartSubtotal();
  const discount = discountAmount > 0 ? Math.round(discountAmount) : Math.round(subtotal * (discountPct / 100));
  const shipping = shippingFor(delivery, address.state);

  const myCoupons = useMyCoupons((s) => s.coupons);
  const [coupon, setCoupon] = useState(couponCode ?? "");
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const onApply = async (raw?: string) => {
    const code = raw ?? coupon;
    setCoupon(code);
    const res = await applyCoupon(code);
    if (res.ok) {
      setCouponSuccess(`Coupon applied - ${res.pct}% off`);
      toast.success(`Coupon applied - ${res.pct}% off`);
    } else {
      setCouponSuccess(null);
      toast.error(res.message);
    }
  };


  const opts = [
    { id: "paystack" as const, label: "Pay with Paystack", desc: "Pay securely with your card, bank or USSD", Icon: CreditCard, badge: <span className="font-bold text-[13px]">paystack</span> },
    { id: "bank" as const, label: "Bank Transfer", desc: "Pay via direct bank transfer", Icon: Building2, badge: <Building2 className="h-5 w-5 text-muted-foreground" /> },
    { id: "card" as const, label: "Pay with Card", desc: "Visa - Mastercard - Verve", Icon: CreditCard, badge: (
      <span className="flex items-center gap-2">
        {paymentBrands.map((b) => (
          <img key={b.name} src={b.src} alt={`${b.name} accepted`} loading="lazy" className="h-6 w-auto object-contain" />
        ))}
      </span>
    ) },
  ];

  return (
    <>
      <CheckoutPage title="Payment" step={3}>
        <div className="space-y-5">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold">Payment</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Choose your preferred payment method.</p>
          </div>

          <section>
            <h2 className="text-[15px] font-semibold mb-3">Coupon Code</h2>
              <div className="space-y-1 max-w-md">
                <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Promo code</label>
                <div className="flex items-center gap-1.5">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") onApply(); }}
                    placeholder="Enter promo code"
                    className="min-w-0 flex-1 h-8 rounded bg-muted px-2.5 text-[11px] placeholder:text-[11px] placeholder:text-muted-foreground/80 focus:outline-none focus:ring-1 focus:ring-ink"
                  />
                  <button type="button" onClick={() => onApply()} className="h-8 px-3 rounded bg-ink text-white text-[11px] font-semibold hover:opacity-90 shrink-0">Apply</button>
                </div>
              </div>
                {couponCode && (
                  <div className="mt-3 space-y-3">
                    {couponSuccess && (
                      <div role="status" className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2.5 text-[12px] font-semibold text-foreground shadow-sm">
                        <CircleCheck className="h-4 w-4 shrink-0" />
                        <span>{couponSuccess}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-3 rounded bg-ink px-3 py-2.5 text-white">
                      <div className="min-w-0">
                        <div className="text-[12px] font-semibold truncate">{couponCode}</div>
                        <div className="text-[10.5px] text-white/80">{discountPct}% off applied · You saved {naira(discount)}</div>
                      </div>
                      <button
                        onClick={() => { removeCoupon(); setCoupon(""); setCouponSuccess(null); toast("Coupon removed"); }}
                        className="shrink-0 p-1 hover:bg-white/10 rounded"
                        aria-label="Remove coupon"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                {myCoupons.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-1.5">Your coupons</div>
                    <div className="flex flex-wrap gap-2">
                      {myCoupons.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => onApply(c.code)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gold/40 bg-gold/5 text-[11px] font-semibold text-ink hover:bg-gold/10"
                          title={c.label}
                        >
                          <Tag className="h-3 w-3 text-gold" /> {c.code} · {c.pct}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
          </section>


          <section>
            <h2 className="text-[15px] font-semibold mb-3">1. Delivery Method</h2>
            <div className="rounded-md border border-ink ring-1 ring-ink px-3 py-3 flex items-center gap-3 bg-background">
              <span className="h-4 w-4 rounded-full border-2 border-ink grid place-items-center"><span className="h-2 w-2 rounded-full bg-ink" /></span>
              {delivery === "ship" ? <Truck className="h-5 w-5" strokeWidth={1.75} /> : <Building2 className="h-5 w-5" strokeWidth={1.75} />}
              <div className="flex-1">
                <div className="text-[14px] font-semibold">{delivery === "ship" ? "Ship to Address" : "Pick Up In Store"}</div>
                <div className="text-[12px] text-muted-foreground">{delivery === "ship" ? "Have your order delivered to your doorstep." : "The Lennox Mall, Lekki Phase 1, Lagos."}</div>
              </div>
              <div className="text-[13px] font-semibold">{shipping === 0 ? "Free" : naira(shipping)}</div>
            </div>
            <Link to="/checkout/information" className="mt-2 inline-block text-[12px] font-semibold underline">Change delivery method</Link>
          </section>

          <section>
            <h2 className="text-[15px] font-semibold mb-3">2. Payment Method</h2>
            <div className="space-y-2">
              {opts.map((o) => {
                const active = pay === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => setPay(o.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 border rounded-md text-left ${active ? "border-ink ring-1 ring-ink" : "border-border hover:bg-muted/40"}`}
                  >
                    <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${active ? "border-ink" : "border-muted-foreground"}`}>
                      {active && <span className="h-2 w-2 rounded-full bg-ink" />}
                    </span>
                    <o.Icon className="h-5 w-5" strokeWidth={1.75} />
                    <div className="flex-1">
                      <div className="text-[14px] font-semibold">{o.label}</div>
                      <div className="text-[12px] text-muted-foreground">{o.desc}</div>
                    </div>
                    {o.badge}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" /> Your payment information is secure and encrypted.
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/checkout/information" className="text-[13px] font-semibold underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Return to Information
            </Link>
            <button
              onClick={() => {
                void syncSession().finally(() => navigate({ to: "/checkout/review" }));
              }}
              className="flex-1 md:flex-none md:min-w-[280px] bg-ink text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              Continue to Review <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </CheckoutPage>
      <Toaster position="top-center" />
    </>
  );
}
