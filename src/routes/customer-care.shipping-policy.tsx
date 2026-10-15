import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Truck, Clock, Wallet, MapPin, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy - ASL ORIGINALS" },
      { name: "description", content: "ASL ORIGINALS shipping policy: delivery times, processing, fees, delays and order tracking." },
    ],
  }),
  component: ShippingPolicy,
});

const rows1 = [
  { loc: "Lagos", val: "Same day delivery" },
  { loc: "Abuja", val: "2 - 4 working days" },
  { loc: "Other States", val: "2 - 3 working days" },
  { loc: "International", val: "5 - 7 working days" },
];
const rows2 = [
  { loc: "Lagos", val: "₦5,000" },
  { loc: "Abuja", val: "₦15,000" },
  { loc: "Other States", val: "₦10,000" },
  { loc: "International", val: "Varies by destination" },
];

function Section({ Icon, title, children }: { Icon: any; title: string; children: React.ReactNode }) {
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

function Table({ head, rows }: { head: [string, string]; rows: { loc: string; val: string }[] }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="grid grid-cols-2 bg-muted/60 text-[12px] font-semibold text-ink">
        <div className="px-4 py-2.5 border-r border-border">{head[0]}</div>
        <div className="px-4 py-2.5">{head[1]}</div>
      </div>
      {rows.map((r, i) => (
        <div key={r.loc} className={`grid grid-cols-2 text-[13px] ${i > 0 ? "border-t border-border" : ""}`}>
          <div className="px-4 py-2.5 border-r border-border">{r.loc}</div>
          <div className="px-4 py-2.5 text-foreground/80">{r.val}</div>
        </div>
      ))}
    </div>
  );
}

function ShippingPolicy() {
  return (
    <CustomerCareScaffold
      activeId="shipping-policy"
      title="Shipping Policy"
      subtitle="We are committed to getting your order to you quickly and securely."
    >
      <p className="text-[13px] text-foreground/75 leading-relaxed">
        Below you will find important information about our shipping options, delivery times, and fees.
      </p>

      <Section Icon={Truck} title="1. Delivery Time">
        <p>We strive to process and deliver your orders as quickly as possible.</p>
        <Table head={["Location", "Estimated Delivery Time"]} rows={rows1} />
      </Section>

      <Section Icon={Clock} title="2. Processing Time">
        <p>
          All orders are processed within 24 - 48 hours (excluding weekends and public holidays).
          You will receive a confirmation email once your order has been shipped.
        </p>
      </Section>

      <Section Icon={Wallet} title="3. Shipping Fees">
        <p>Shipping fees are flat rates based on your delivery location.</p>
        <Table head={["Location", "Delivery Fee (Flat Rate)"]} rows={rows2} />
      </Section>

      <Section Icon={AlertTriangle} title="4. Delivery Delays">
        <p>
          While we do everything possible to meet the estimated delivery times, delays may occasionally occur
          due to unforeseen circumstances beyond our control (e.g. weather, courier delays, or public holidays).
        </p>
      </Section>

      <Section Icon={MapPin} title="5. Tracking Your Order">
        <p>Once your order is shipped, you will receive a tracking number via email or SMS to monitor your delivery in real time.</p>
        <Link to="/customer-care/track-order" className="inline-flex items-center gap-2 mt-2 text-[12.5px] font-semibold text-ink underline underline-offset-4">
          Track your order →
        </Link>
      </Section>

      <div className="mt-6 rounded-md bg-[#fbf3e2] border border-[#f0e2be] p-4 flex gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed">
          <div className="font-semibold text-ink mb-0.5">Important Note</div>
          Please ensure your delivery details are accurate to avoid delays. ASL ORIGINALS is not responsible for orders
          delayed due to incorrect or incomplete addresses provided by the customer.
        </div>
      </div>
    </CustomerCareScaffold>
  );
}
