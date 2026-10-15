import { createFileRoute } from "@tanstack/react-router";
import { Wallet, Timer, CreditCard, Ban, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy - ASL ORIGINALS" },
      { name: "description", content: "How ASL ORIGINALS processes refunds - timelines, methods, deductions and exceptions." },
    ],
  }),
  component: RefundPolicy,
});

function Section({ Icon, title, children }: any) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
        <h2 className="font-semibold text-[16px]">{title}</h2>
      </div>
      <div className="pl-8 text-[13px] text-foreground/80 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

function RefundPolicy() {
  return (
    <CustomerCareScaffold
      activeId="refund-policy"
      title="Refund Policy"
      subtitle="Fair, transparent refunds - processed promptly once your return is approved."
    >
      <Section Icon={Timer} title="1. Refund Timeline">
        <p>Refunds are processed within <strong>5 - 10 working days</strong> after your returned item has been received and inspected.</p>
      </Section>

      <Section Icon={CreditCard} title="2. Refund Method">
        <ul className="list-disc pl-5 space-y-1">
          <li>Card & Paystack payments - refunded to the original payment method.</li>
          <li>Bank transfers - refunded to the account details you provide.</li>
          <li>Wallet balance - credited instantly to your ASL Wallet.</li>
        </ul>
      </Section>

      <Section Icon={Wallet} title="3. Partial Refunds">
        <p>A partial refund may apply if the returned item is not in its original condition, is missing tags or shows signs of use.</p>
      </Section>

      <Section Icon={Ban} title="4. Non-Refundable">
        <ul className="list-disc pl-5 space-y-1">
          <li>Original shipping fees (unless the return is due to our error)</li>
          <li>Sale, clearance and limited-edition items</li>
          <li>Concierge-sourced or custom-made orders</li>
        </ul>
      </Section>

      <div className="mt-6 rounded-md bg-[#fbf3e2] border border-[#f0e2be] p-4 flex gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed">
          <div className="font-semibold text-ink mb-0.5">Delayed Refunds?</div>
          If you haven't received your refund after 10 working days, please contact your bank first, then reach out to our support team.
        </div>
      </div>
    </CustomerCareScaffold>
  );
}
