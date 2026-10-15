import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { Mail, Phone, Bell, Truck, Building2, MapPin, Lock, ArrowLeft, Tag, Edit3 } from "lucide-react";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { naira } from "@/components/checkout/checkoutData";
import { useCheckout, shippingFor } from "@/lib/checkout-store";
import { useCartSubtotal } from "@/lib/cart-store";

export const Route = createFileRoute("/checkout/review")({
  head: () => ({ meta: [{ title: "Checkout: Review - ASL ORIGINALS" }] }),
  component: ReviewPage,
});

function Row({ title, editTo, children }: { title: string; editTo: string; children: React.ReactNode }) {
  return (
    <section className="border border-border rounded-md p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold">{title}</h3>
        <Link to={editTo} className="text-[12px] font-semibold underline inline-flex items-center gap-1"><Edit3 className="h-3 w-3" /> Edit</Link>
      </div>
      <div className="text-[13px] space-y-1.5 text-foreground/85">{children}</div>
    </section>
  );
}

const PAYMENT_LABEL: Record<string, string> = {
  paystack: "Pay with Paystack - You will be redirected to complete payment securely.",
  bank: "Bank Transfer - You will receive account details after placing your order.",
  card: "Pay with Card - Visa · Mastercard · Verve",
};

function ReviewPage() {
  const navigate = useNavigate();
  const { contact, address, delivery, payment, coupon, discountPct } = useCheckout();
  const subtotal = useCartSubtotal();
  const discount = Math.round(subtotal * (discountPct / 100));
  const shipping = shippingFor(delivery, address.state);

  return (
    <>
      <CheckoutPage title="Review Order" step={4}>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold">Review Your Order</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Please review your order details before placing your order.</p>
          </div>

          <Row title="1. Contact Information" editTo="/checkout/information">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {contact.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}</div>
            {contact.subscribe && <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /> Subscribed to newsletter and offers</div>}
          </Row>

          <Row title="2. Delivery Method" editTo="/checkout/information">
            <div className="flex items-center gap-2 font-semibold">
              {delivery === "ship" ? <Truck className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {delivery === "ship" ? "Ship to Address" : "Pick Up In Store"}
              <span className="ml-auto font-bold text-ink">{shipping === 0 ? "Free" : naira(shipping)}</span>
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-border mt-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                {delivery === "ship" ? (
                  <>
                    {address.fullName} · {address.address}{address.apartment ? `, ${address.apartment}` : ""}, {address.city}, {address.state}, {address.postal}, {address.country}
                    <div className="text-[12px] text-muted-foreground mt-0.5">Est. Delivery: 2 - 5 working days</div>
                  </>
                ) : (
                  <>ASL ORIGINALS Lekki - The Lennox Mall, Admiralty Way, Lekki Phase 1, Lagos.</>
                )}
              </div>
            </div>
          </Row>

          <Row title="3. Payment Method" editTo="/checkout/payment">
            <div className="flex items-center justify-between">
              <span>{PAYMENT_LABEL[payment]}</span>
              {payment === "paystack" && <span className="font-bold text-[13px]">paystack</span>}
            </div>
          </Row>

          <Row title="4. Coupon" editTo="/checkout/payment">
            {coupon ? (
              <div className="flex items-center justify-between rounded-md bg-ink border border-ink text-white px-3 py-2 text-[12px] font-semibold">
                <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5" /> {coupon} <span>Applied</span></span>
                <span>- {naira(discount)}</span>
              </div>
            ) : (
              <div className="text-[12px] text-muted-foreground">No coupon applied. <Link to="/checkout/payment" className="underline">Add one</Link>.</div>
            )}
          </Row>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/checkout/payment" className="text-[13px] font-semibold underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Return to Payment
            </Link>
            <button
              onClick={() => navigate({ to: "/checkout/place-order" })}
              className="flex-1 md:flex-none md:min-w-[280px] bg-ink text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Lock className="h-4 w-4" /> Place Order →
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">By placing your order, you agree to our <Link to="/customer-care/terms-of-service" className="underline">Terms of Service</Link> and <Link to="/customer-care/privacy-policy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </CheckoutPage>
      <Toaster position="top-center" />
    </>
  );
}
