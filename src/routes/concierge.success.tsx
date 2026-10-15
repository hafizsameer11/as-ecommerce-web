import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Calendar, CreditCard, ShoppingBag, Search, Package, Truck, Headphones, HelpCircle, MessageCircle, Mail, ShieldCheck, UserPlus } from "lucide-react";
import { Toaster } from "sonner";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { naira } from "@/components/concierge-checkout/conciergeCheckoutData";
import {
  readConciergePayment,
  useConciergeCheckoutState,
  verifyConciergeReturn,
} from "@/components/concierge-checkout/useConciergeCheckout";

const searchSchema = z.object({
  reference: fallback(z.string(), "").default(""),
  trxref: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/concierge/success")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({ meta: [{ title: "Payment Successful - ASL ORIGINALS" }] }),
  component: ConciergeSuccessPage,
});

const nextSteps = [
  { Icon: ShoppingBag, t: "Request Received", d: "Your request has been received and confirmed." },
  { Icon: Search, t: "Sourcing", d: "We will source your item from trusted retailers." },
  { Icon: Package, t: "Processing", d: "We will inspect and prepare your item." },
  { Icon: Truck, t: "Delivery", d: "Your item will be shipped to your delivery address." },
];

function ConciergeSuccessPage() {
  const { reference, trxref } = Route.useSearch();
  const remembered = readConciergePayment();
  const { items: conciergeItems, summary } = useConciergeCheckoutState();
  const CONCIERGE_SERVICE_FEE = summary.serviceFee;
  const CONCIERGE_SHIPPING_EST = summary.shippingEstimate;
  const conciergeSubtotal = () => summary.subtotal;
  const conciergeTotal = () => summary.estimatedTotal;
  const [requestId, setRequestId] = useState(remembered?.number || remembered?.requestId || "—");
  const [verifyLabel, setVerifyLabel] = useState("Verifying payment…");
  const [paidAt] = useState(() => new Date());

  useEffect(() => {
    const ref = reference || trxref || remembered?.reference;
    void verifyConciergeReturn(ref).then((res) => {
      if (res?.order?.number) setRequestId(res.order.number);
      else if (remembered?.number) setRequestId(remembered.number);
      const status = (res as { payment?: { status?: string } } | null)?.payment?.status;
      setVerifyLabel(status ? `Payment ${status}` : ref ? "Payment verified" : "Payment recorded");
    }).catch(() => setVerifyLabel("Payment pending verification"));
  }, [reference, trxref, remembered?.reference, remembered?.number]);

  return (
    <AccountInnerScaffold title="" activeId="requests" backTo="/account">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Success header */}
        <div className="text-center space-y-3 py-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-muted grid place-items-center">
            <CheckCircle2 className="h-9 w-9 text-ink" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Payment Successful!</h1>
          <p className="text-[13px] text-muted-foreground max-w-xl mx-auto">
            Your request has been confirmed and we have received your payment.
            <br />We will start processing your request right away.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            {/* Meta card */}
            <div className="rounded-lg bg-[#f5f5f4] border border-border p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-white border border-border grid place-items-center"><FileText className="h-5 w-5 text-ink" /></div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Request ID</div>
                  <div className="text-[14px] font-bold">{requestId}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-white border border-border grid place-items-center"><Calendar className="h-5 w-5 text-ink" /></div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Date</div>
                  <div className="text-[13px] font-semibold">{paidAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                  <div className="text-[10px] text-muted-foreground">{paidAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md bg-white border border-border grid place-items-center"><CreditCard className="h-5 w-5 text-ink" /></div>
                <div>
                  <div className="text-[11px] text-muted-foreground">Payment Method</div>
                  <div className="text-[13px] font-semibold">Paystack</div>
                  <div className="text-[10px] text-muted-foreground">{remembered?.reference ? `Ref ${remembered.reference} · ${verifyLabel}` : verifyLabel}</div>
                </div>
              </div>
            </div>

            {/* Next steps */}
            <div className="border border-border rounded-lg p-5 bg-card">
              <h3 className="font-display font-bold text-lg mb-4">What happens next?</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                {nextSteps.map((s, i) => (
                  <div key={s.t} className="text-center relative">
                    <div className="mx-auto h-11 w-11 rounded-full bg-muted border border-border grid place-items-center">
                      <s.Icon className="h-5 w-5 text-ink" />
                    </div>
                    <div className="text-[13px] font-semibold mt-2">{i + 1}. {s.t}</div>
                    <div className="text-[11px] text-muted-foreground leading-snug mt-1">{s.d}</div>
                    {i < nextSteps.length - 1 && (
                      <div className="hidden md:block absolute top-5 left-[calc(50%+22px)] right-[calc(-50%+22px)] h-px bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Two info cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-[#faf5eb] border border-amber-100/60 p-4 flex gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-full bg-amber-100/70 shrink-0"><Headphones className="h-4 w-4 text-amber-700" /></div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">We're here to keep you updated</div>
                  <div className="text-[11px] text-muted-foreground leading-snug">You can track the progress of your request in real time from your account.</div>
                  <Link to="/track-request" className="mt-2 inline-block border border-border bg-white rounded-md px-3 py-1.5 text-[12px] font-semibold">Track My Request</Link>
                </div>
              </div>
              <div className="rounded-lg bg-[#faf5eb] border border-amber-100/60 p-4 flex gap-3">
                <div className="h-9 w-9 grid place-items-center rounded-full bg-amber-100/70 shrink-0"><HelpCircle className="h-4 w-4 text-amber-700" /></div>
                <div className="flex-1 space-y-1.5">
                  <div className="text-[13px] font-semibold">Need help?</div>
                  <div className="text-[11px] text-muted-foreground">Our concierge team is here to assist you.</div>
                  <div className="flex flex-col gap-1 text-[12px] pt-1">
                    <a className="inline-flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
                    <a className="inline-flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> Email Us</a>
                    <a className="inline-flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5" /> Live Chat</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Invite banner */}
            <div className="rounded-lg bg-[#faf5eb] border border-amber-100/60 p-4 flex items-center gap-4">
              <div className="h-11 w-11 rounded-full bg-amber-100/70 grid place-items-center shrink-0"><UserPlus className="h-5 w-5 text-amber-700" /></div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">Invite a friend and get rewarded!</div>
                <div className="text-[11px] text-muted-foreground">Share ASL ORIGINALS and earn rewards when they place their first request.</div>
              </div>
              <Link to="/account/referrals" className="border border-border bg-white rounded-md px-4 py-2 text-[12px] font-semibold shrink-0">Invite Now</Link>
            </div>
          </div>

          {/* Summary sidebar */}
          <aside className="space-y-4">
            <div className="border border-border rounded-lg p-5 bg-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Order Summary</h3>
                <Link to="/account/requests" className="text-[12px] font-semibold underline">View Requests</Link>
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
                <div className="flex justify-between"><span className="text-muted-foreground">Concierge Service Fee</span><span className="font-medium">{naira(CONCIERGE_SERVICE_FEE)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping (Est.)</span><span className="font-medium">{naira(CONCIERGE_SHIPPING_EST)}</span></div>
              </div>
              <div className="flex justify-between items-baseline border-t border-border pt-3">
                <span className="font-semibold">Total Paid</span>
                <span className="font-semibold text-xl text-ink">{naira(conciergeTotal())}</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-muted text-ink border border-border rounded-md px-3 py-1.5 text-[12px] font-semibold w-full justify-center">
                <CheckCircle2 className="h-4 w-4" /> Payment Successful
              </div>
            </div>
            <div className="border border-border rounded-lg p-4 bg-card flex gap-3">
              <ShieldCheck className="h-5 w-5 text-ink shrink-0 mt-0.5" />
              <div>
                <div className="text-[13px] font-semibold">Secure & Trusted</div>
                <div className="text-[11px] text-muted-foreground">Your payment is secure and your items are 100% authentic.</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Toaster position="top-center" />
    </AccountInnerScaffold>
  );
}
