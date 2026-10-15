import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { useRef, useState } from "react";
import { Check, ShieldCheck, HelpCircle, Info, Lock, Building2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { naira } from "@/components/concierge-checkout/conciergeCheckoutData";
import {
  payConciergeCart,
  useConciergeCheckoutState,
} from "@/components/concierge-checkout/useConciergeCheckout";

export const Route = createFileRoute("/concierge/payment")({
  validateSearch: z.object({ requestId: z.string().optional() }),
  head: () => ({ meta: [{ title: "Concierge - Proceed to Payment" }] }),
  component: ConciergePaymentPage,
});

function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { id: 1, label: "Shipping" },
    { id: 2, label: "Payment" },
    { id: 3, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-3 w-full">
      {steps.map((s, i) => {
        const done = s.id < current;
        const active = s.id === current;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <span className={`grid place-items-center h-7 w-7 rounded-full text-[11px] font-bold border ${
                active || done ? "bg-amber-500 text-white border-amber-500" : "bg-background text-muted-foreground border-border"
              }`}>
                {done ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span className={`text-[13px] ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-3" />}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[12px] text-muted-foreground">{label} {required && <span className="text-red-500">*</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const input = "w-full border border-border rounded-md px-3 py-2.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-amber-500";

function ConciergePaymentPage() {
  const nav = useNavigate();
  const { requestId } = Route.useSearch();
  const [method, setMethod] = useState<"paystack" | "transfer">("paystack");
  const [busy, setBusy] = useState(false);
  const { items: conciergeItems, summary } = useConciergeCheckoutState();
  const CONCIERGE_SERVICE_FEE = summary.serviceFee;
  const CONCIERGE_SHIPPING_EST = summary.shippingEstimate;
  const conciergeSubtotal = () => summary.subtotal;
  const conciergeTotal = () => summary.estimatedTotal;
  const fullNameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const aptRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLSelectElement>(null);

  const onPay = async () => {
    const fullName = fullNameRef.current?.value.trim() || "";
    const phone = phoneRef.current?.value.trim() || "";
    const address = addressRef.current?.value.trim() || "";
    const city = cityRef.current?.value.trim() || "";
    const state = stateRef.current?.value.trim() || "";
    if (!fullName || !phone || !address || !city || !state) {
      return toast.error("Please fill in your delivery details");
    }
    setBusy(true);
    try {
      const res = await payConciergeCart({
        requestId,
        address: {
          fullName,
          phone,
          address,
          apartment: aptRef.current?.value.trim() || undefined,
          city,
          state,
          postal: postalRef.current?.value.trim() || undefined,
          country: countryRef.current?.value || "Nigeria",
        },
        method: method === "transfer" ? "bank_transfer" : "card",
      });
      if (!res.ok) toast.error(res.message || "Payment could not start");
      else if (res.message === "paid") {
        toast.success("Payment recorded");
        nav({ to: "/concierge/success" });
      }
      /* message === "redirect" → browser left for authorizationUrl */
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AccountInnerScaffold title="Proceed to Payment" subtitle="Please fill in your details and choose a payment method to complete your request." activeId="requests" backTo="/concierge/cart">
      <Stepper current={1} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6 min-w-0">
          {/* Contact */}
          <section className="border border-border rounded-lg p-5 bg-card space-y-4">
            <h3 className="font-display font-bold text-lg">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name" required><input ref={fullNameRef} className={input} placeholder="Full name" /></Field>
              <Field label="Email Address" required><input className={input} type="email" placeholder="you@email.com" /></Field>
            </div>
            <Field label="Phone Number" required>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <select className={input} defaultValue="+234"><option>+234</option><option>+1</option><option>+44</option></select>
                <input ref={phoneRef} className={input} placeholder="801 234 5678" />
              </div>
            </Field>
          </section>

          {/* Delivery */}
          <section className="border border-border rounded-lg p-5 bg-card space-y-4">
            <h3 className="font-display font-bold text-lg">Delivery Information</h3>
            <Field label="Delivery Address" required><input ref={addressRef} className={input} placeholder="House No, Street Name, Area" /></Field>
            <input ref={aptRef} className={input} placeholder="Apartment, Suite, Unit, etc. (Optional)" />
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="City" required><input ref={cityRef} className={input} placeholder="City" /></Field>
              <Field label="State" required>
                <select ref={stateRef} className={input} defaultValue="Lagos"><option>Lagos</option><option>Abuja</option><option>Rivers</option></select>
              </Field>
              <Field label="Postal Code" required><input ref={postalRef} className={input} placeholder="Postal code" /></Field>
            </div>
            <Field label="Country" required>
              <select ref={countryRef} className={input} defaultValue="Nigeria"><option>Nigeria</option><option>Ghana</option></select>
            </Field>
          </section>

          {/* Payment */}
          <section className="border border-border rounded-lg p-5 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Payment Method</h3>
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1"><Lock className="h-3 w-3" /> All payments are secure and encrypted</span>
            </div>
            <p className="text-[12px] text-muted-foreground -mt-2">Choose a payment method</p>
            <button
              type="button"
              onClick={() => setMethod("paystack")}
              className={`w-full text-left border rounded-lg p-4 transition ${method === "paystack" ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/40" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${method === "paystack" ? "border-amber-500" : "border-muted-foreground"}`}>
                    {method === "paystack" && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                  </span>
                  <span className="text-[13px] font-semibold">Pay with Paystack</span>
                </span>
                <span className="font-bold text-[13px]">paystack</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 pl-7">Pay securely with your debit card, credit card, USSD or bank transfer.</div>
              <div className="flex items-center gap-2 mt-3 pl-7 text-[10px]">
                <span className="px-2 py-1 border border-border rounded font-bold text-blue-800 bg-white">VISA</span>
                <span className="px-2 py-1 border border-border rounded font-bold text-red-600 bg-white">MC</span>
                <span className="px-2 py-1 border border-border rounded font-bold text-ink bg-white">Verve</span>
                <span className="px-2 py-1 border border-border rounded font-bold text-slate-700 bg-white">RuPay</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("transfer")}
              className={`w-full text-left border rounded-lg p-4 transition ${method === "transfer" ? "border-amber-500 ring-1 ring-amber-500 bg-amber-50/40" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${method === "transfer" ? "border-amber-500" : "border-muted-foreground"}`}>
                    {method === "transfer" && <span className="h-2 w-2 rounded-full bg-amber-500" />}
                  </span>
                  <span className="text-[13px] font-semibold">Pay via Bank Transfer</span>
                </span>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 pl-7">Make payment directly to our official bank account. You will receive the account details after you place your request.</div>
            </button>
          </section>

          <button
            disabled={busy}
            onClick={() => void onPay()}
            className="w-full bg-ink text-white py-3.5 rounded-md text-sm font-semibold hover:opacity-90 inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy ? "Starting payment…" : "Continue to Payment"} <Lock className="h-4 w-4" />
          </button>
          <p className="text-center text-[11px] text-muted-foreground">You will be redirected to Paystack to complete your payment securely.</p>
        </div>

        {/* Sidebar summary */}
        <aside className="space-y-4">
          <div className="border border-border rounded-lg p-5 bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg">Your Request Summary</h3>
              <Link to="/concierge/cart" className="text-[12px] font-semibold underline">Edit Cart</Link>
            </div>
            <div className="text-[12px] text-muted-foreground -mt-2">{conciergeItems.length} Items</div>
            <div className="divide-y divide-border">
              {conciergeItems.map((i) => (
                <div key={i.id} className="flex items-start gap-3 py-3">
                  <img src={i.image} alt={i.name} className="h-12 w-12 rounded-md object-cover bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">{i.brand}</div>
                    <div className="text-[12px] font-medium leading-tight">{i.name}</div>
                    <div className="text-[11px] text-muted-foreground">{i.size ? `Size: ${i.size} | ` : ""}Qty: {i.qty}</div>
                  </div>
                  <div className="text-[12px] font-semibold whitespace-nowrap">{naira(i.price)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-[13px] border-t border-border pt-3">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({conciergeItems.length} items)</span><span className="font-medium">{naira(conciergeSubtotal())}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1">Concierge Service Fee <Info className="h-3 w-3" /></span><span className="font-medium">{naira(CONCIERGE_SERVICE_FEE)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground inline-flex items-center gap-1">Shipping (Est.) <Info className="h-3 w-3" /></span><span className="font-medium">{naira(CONCIERGE_SHIPPING_EST)}</span></div>
            </div>
            <div className="flex justify-between items-baseline border-t border-border pt-3">
              <span className="font-semibold">Estimated Total</span>
              <span className="font-semibold text-xl">{naira(conciergeTotal())}</span>
            </div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card flex gap-3">
            <ShieldCheck className="h-5 w-5 text-ink shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-semibold">Secure & Trusted</div>
              <div className="text-[11px] text-muted-foreground">Your payment is secure and items are 100% authentic.</div>
            </div>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card flex gap-3">
            <HelpCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-semibold">Need help?</div>
              <div className="text-[11px] text-muted-foreground">Our concierge team is here to help you every step of the way.</div>
              <Link to="/account/help/contact" className="text-[12px] font-semibold text-amber-700 underline mt-1 inline-block">Contact Concierge</Link>
            </div>
          </div>
        </aside>
      </div>
      <Toaster position="top-center" />
    </AccountInnerScaffold>
  );
}
