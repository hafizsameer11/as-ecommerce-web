import { createFileRoute, Link } from "@tanstack/react-router";
import { RotateCcw, CheckCircle2, XCircle, PackageCheck, Clock, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy - ASL ORIGINALS" },
      { name: "description", content: "Return items within 7 days. Read the ASL ORIGINALS return conditions and process." },
    ],
  }),
  component: ReturnPolicy,
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

function ReturnPolicy() {
  return (
    <CustomerCareScaffold
      activeId="return-policy"
      title="Return Policy"
      subtitle="Not completely happy? We accept returns within 7 days of delivery."
    >
      <p className="text-[13px] text-foreground/75 leading-relaxed">
        Please read the conditions below before initiating a return.
      </p>

      <Section Icon={Clock} title="1. Return Window">
        <p>Returns must be initiated within <strong>7 days</strong> of receiving your order. Items received after this window will not be accepted.</p>
      </Section>

      <Section Icon={CheckCircle2} title="2. Items Eligible for Return">
        <ul className="list-disc pl-5 space-y-1">
          <li>Unworn, unwashed and unused items</li>
          <li>Items in their original packaging with all tags attached</li>
          <li>Items free of stains, odours and damage caused by the customer</li>
        </ul>
      </Section>

      <Section Icon={XCircle} title="3. Non-Returnable Items">
        <ul className="list-disc pl-5 space-y-1">
          <li>Fragrances, cosmetics and personal-care items once opened</li>
          <li>Sale, clearance and limited-edition drops</li>
          <li>Concierge-sourced and custom orders</li>
          <li>Innerwear, swimwear and pierced accessories</li>
        </ul>
      </Section>

      <Section Icon={PackageCheck} title="4. How to Return an Item">
        <ol className="list-decimal pl-5 space-y-1">
          <li>Contact our support team within 7 days of delivery.</li>
          <li>Share your order number, reason for return and clear photos of the item.</li>
          <li>We'll respond within 24 hours with return instructions.</li>
          <li>Ship the item back using the approved courier.</li>
        </ol>
        <Link to="/customer-care/contact-us" className="inline-flex mt-2 text-[12.5px] font-semibold text-ink underline underline-offset-4">
          Start a return →
        </Link>
      </Section>

      <Section Icon={RotateCcw} title="5. Return Shipping Costs">
        <p>Return shipping is covered by the customer unless the item is defective or an incorrect item was shipped.</p>
      </Section>

      <div className="mt-6 rounded-md bg-[#fbf3e2] border border-[#f0e2be] p-4 flex gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed">
          <div className="font-semibold text-ink mb-0.5">Please note</div>
          All returns are inspected on arrival. Items returned in an unacceptable condition will be shipped back to you at your expense.
        </div>
      </div>
    </CustomerCareScaffold>
  );
}
