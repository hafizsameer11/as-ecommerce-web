import { createFileRoute } from "@tanstack/react-router";
import { FileText, Monitor, Tag, CreditCard, Truck, RotateCcw, Copyright, AlertTriangle, Pencil, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service - ASL ORIGINALS" },
      { name: "description", content: "The terms that govern your use of the ASL ORIGINALS website and services." },
    ],
  }),
  component: TermsOfService,
});

const sections = [
  { Icon: FileText, title: "1. Acceptance of Terms", body: "By accessing or using the ASL ORIGINALS website, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree with any part of these terms, please do not use our website." },
  { Icon: Monitor, title: "2. Use of Our Website", body: "You agree to use our website for lawful purposes only. You must not use our website in any way that may damage, disable, or impair the site or interfere with any other user's experience." },
  { Icon: Tag, title: "3. Products and Pricing", body: "We strive to display our products, pricing, and other information as accurately as possible. However, we do not warrant that product descriptions, prices, or other content is always accurate, complete, reliable, current, or error-free." },
  { Icon: CreditCard, title: "4. Orders and Payment", body: "All orders are subject to availability and confirmation of payment. We reserve the right to refuse or cancel any order at our sole discretion, including in cases of pricing errors or suspected fraud." },
  { Icon: Truck, title: "5. Shipping and Delivery", body: "We will deliver your order within the estimated timeframes provided. Delays may occur due to unforeseen circumstances. Please refer to our Shipping Policy for more details." },
  { Icon: RotateCcw, title: "6. Returns and Refunds", body: "Returns and refunds are handled in accordance with our Return and Refund Policy. Please review the policy on our website for eligibility, conditions, and timeframes." },
  { Icon: Copyright, title: "7. Intellectual Property", body: "All content on this website, including logos, images, text, graphics, and designs, are the property of ASL ORIGINALS and are protected by copyright and trademark laws." },
  { Icon: AlertTriangle, title: "8. Limitation of Liability", body: "ASL ORIGINALS shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or products." },
  { Icon: Pencil, title: "9. Changes to Terms", body: "We reserve the right to update or change these Terms of Service at any time. Changes will be posted on this page with the updated effective date." },
  { Icon: Phone, title: "10. Contact Us", body: "If you have any questions about these Terms of Service, please contact us." },
];

function TermsOfService() {
  return (
    <CustomerCareScaffold
      activeId="terms-of-service"
      title="Terms of Service"
      subtitle="Welcome to ASL ORIGINALS. By accessing or using our website, you agree to comply with and be bound by the following terms."
    >
      <div className="space-y-5">
        {sections.map((s) => (
          <div key={s.title} className="flex gap-4">
            <div className="shrink-0 h-9 w-9 rounded-full bg-muted grid place-items-center">
              <s.Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[13.5px] text-ink">{s.title}</h3>
              <p className="mt-1 text-[12.5px] text-foreground/75 leading-relaxed">{s.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-white p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Row Icon={Mail} label="Email" value="customerservice@asloriginals.com" />
        <Row Icon={Phone} label="Phone / WhatsApp" value="+234 810 123 4567" />
        <Row Icon={MapPin} label="Address" value="Lekki Phase 1, Lagos, Nigeria" />
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-4 flex items-center gap-4">
        <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/80">
          <div className="font-semibold text-ink">Secure Shopping</div>
          Your security is important to us. We use industry-standard encryption to protect your information.
        </div>
      </div>
    </CustomerCareScaffold>
  );
}

function Row({ Icon, label, value }: { Icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
        <div className="text-[12.5px] mt-0.5 text-ink">{value}</div>
      </div>
    </div>
  );
}
