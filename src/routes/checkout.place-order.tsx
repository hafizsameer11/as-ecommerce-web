import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast, Toaster } from "sonner";
import { Mail, Phone, Bell, Truck, Building2, MapPin, Tag, Lock, ArrowLeft, ShieldCheck, Edit3 } from "lucide-react";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { naira } from "@/components/checkout/checkoutData";
import { useCheckout, shippingFor, checkoutTotalFallback } from "@/lib/checkout-store";
import { useCart, useCartSubtotal } from "@/lib/cart-store";
import { commerceApi } from "@/lib/api/commerce";
import { apiBaseUrl } from "@/lib/api/client";
import { saveCheckoutPending } from "@/lib/checkout-pending";

export const Route = createFileRoute("/checkout/place-order")({
  head: () => ({ meta: [{ title: "Checkout: Place Order - ASL ORIGINALS" }] }),
  component: PlaceOrderPage,
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
  paystack: "Pay with Paystack - Secure payment via Paystack",
  bank: "Bank Transfer - Direct account transfer",
  card: "Pay with Card - Visa · Mastercard · Verve",
};

function PlaceOrderPage() {
  const navigate = useNavigate();
  const {
    contact,
    address,
    delivery,
    payment,
    coupon,
    discountPct,
    discountAmount,
    syncSession,
    getPlaceOrderIdempotencyKey,
    clearPlaceOrderIdempotencyKey,
  } = useCheckout();
  const items = useCart((s) => s.items);
  const subtotal = useCartSubtotal();
  const discount = discountAmount > 0 ? Math.round(discountAmount) : Math.round(subtotal * (discountPct / 100));
  const shipping = shippingFor(delivery, address.state);
  const displayTotal = checkoutTotalFallback(subtotal, discount, shipping);
  const [busy, setBusy] = useState(false);

  const place = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate({ to: "/shop" });
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      await syncSession();
      const snap = await commerceApi.getCheckout();
      const expectedTotal = snap.totals?.total;
      const returnUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/checkout/confirmation`
          : undefined;

      const result = await commerceApi.placeOrder({
        returnUrl,
        expectedTotal,
        idempotencyKey: getPlaceOrderIdempotencyKey(),
      });

      saveCheckoutPending({
        orderNumber: result.order.number,
        orderId: result.order.id,
        accessToken: result.order.accessToken,
        paymentReference: result.payment?.reference,
      });

      // Cart is converted server-side; clear local bag without another DELETE.
      useCart.setState({ items: [] });
      clearPlaceOrderIdempotencyKey();

      const confirmSearch = {
        id: result.order.number,
        orderId: result.order.id,
        token: result.order.accessToken ?? "",
        reference: result.payment?.reference ?? "",
      };

      if (result.payment?.authorizationUrl) {
        const payUrl = result.payment.authorizationUrl.startsWith("http")
          ? result.payment.authorizationUrl
          : `${apiBaseUrl()}${result.payment.authorizationUrl}`;
        toast.success("Redirecting to payment…");
        window.location.href = payUrl;
        return;
      }

      toast.success("Order placed!");
      setTimeout(() => navigate({ to: "/checkout/confirmation", search: confirmSearch }), 350);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place order");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <CheckoutPage title="Place Order" step={5} showPlace>
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold">Place Your Order</h1>
            <p className="text-[13px] text-muted-foreground mt-1">Please confirm your order details and click "Place Order" to complete your purchase.</p>
          </div>

          <Row title="1. Contact Information" editTo="/checkout/information">
            <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {contact.email}</div>
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {contact.phone}</div>
            {contact.subscribe && <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /> Subscribed to newsletter and offers</div>}
          </Row>

          <Row title="2. Delivery Method" editTo="/checkout/information">
            <div className="flex items-center gap-2 font-semibold">
              {delivery === "ship" ? <Truck className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}
              {delivery === "ship" ? "Ship to Address" : "Pick Up In Store"} ({shipping === 0 ? "Free" : naira(shipping)})
            </div>
            <div className="flex items-start gap-2 pt-2 border-t border-border mt-2">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                {delivery === "ship" ? (
                  <>
                    <div className="font-semibold">{address.fullName}</div>
                    <div className="text-[12px] text-muted-foreground">{address.address}{address.apartment ? `, ${address.apartment}` : ""}, {address.city}, {address.state}, {address.postal}, {address.country}</div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold">ASL ORIGINALS Lekki</div>
                    <div className="text-[12px] text-muted-foreground">The Lennox Mall, Admiralty Way, Lekki Phase 1, Lagos, Nigeria.</div>
                  </>
                )}
              </div>
            </div>
          </Row>

          <Row title="3. Payment Method" editTo="/checkout/payment">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">{PAYMENT_LABEL[payment]}</span>
              {payment === "paystack" && <span className="font-bold text-[13px]">paystack</span>}
            </div>
          </Row>

          {coupon && (
            <Row title="4. Coupon Code" editTo="/checkout/payment">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> {coupon}</span>
                <span className="flex items-center gap-3">
                  <span className="text-ink font-bold text-[12px]">Applied</span>
                  <span className="font-semibold">- {naira(discount)}</span>
                </span>
              </div>
            </Row>
          )}

          <div className="rounded-md bg-ink border border-ink text-white px-3 py-2.5 flex items-center gap-2 text-[12px] font-semibold">
            <ShieldCheck className="h-4 w-4" /> 100% Secure Checkout - Your payment is safe and encrypted. We do not store your card details.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link to="/checkout/review" className="text-[13px] font-semibold underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" /> Return to Review
            </Link>
            <button
              onClick={() => void place()}
              disabled={busy}
              className="flex-1 md:flex-none md:min-w-[320px] bg-ink text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Lock className="h-4 w-4" /> {busy ? "Placing…" : `Place Order (${naira(displayTotal)})`}
            </button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">By placing your order, you agree to our <Link to="/customer-care/terms-of-service" className="underline">Terms of Service</Link> and <Link to="/customer-care/privacy-policy" className="underline">Privacy Policy</Link>.</p>
        </div>
      </CheckoutPage>
      <Toaster position="top-center" />
    </>
  );
}
