import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingBag, ShoppingCart, ClipboardList, CreditCard, PackageOpen, Truck, CheckCircle2, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";

export const Route = createFileRoute("/customer-care/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works - ASL ORIGINALS" },
      { name: "description", content: "Simple, secure shopping with ASL ORIGINALS - from browsing to delivery in 7 easy steps." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { Icon: ShoppingBag, title: "Browse & Shop", desc: "Explore our latest collections and add your favourite items to the cart." },
  { Icon: ShoppingCart, title: "Add to Cart", desc: 'Select your size, quantity, and click "Add to Cart".' },
  { Icon: ClipboardList, title: "Checkout", desc: "Go to checkout and fill in your shipping information." },
  { Icon: CreditCard, title: "Make Payment", desc: "Choose your preferred payment method and complete your secure payment." },
  { Icon: PackageOpen, title: "Order Processing", desc: "We confirm your order and carefully pack your items." },
  { Icon: Truck, title: "Shipping", desc: "Your order is shipped and you will receive a tracking number." },
  { Icon: CheckCircle2, title: "Delivery", desc: "We deliver your order to your doorstep. Enjoy your purchase!" },
];

function HowItWorks() {
  return (
    <CustomerCareScaffold
      activeId="how-it-works"
      title="How It Works"
      subtitle="Shopping with ASL ORIGINALS is simple, secure, and designed for you."
    >
      <p className="text-[13px] text-foreground/75 leading-relaxed">Follow these simple steps from browsing to delivery.</p>

      <ol className="space-y-4">
        {steps.map((s, i) => (
          <li key={s.title} className="flex items-start gap-4 rounded-md border border-border bg-white p-4">
            <div className="h-12 w-12 rounded-full bg-muted grid place-items-center shrink-0">
              <s.Icon className="h-5 w-5 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="h-5 w-5 rounded-full bg-ink text-white text-[11px] font-bold grid place-items-center">{i + 1}</span>
                <h3 className="font-semibold text-[14.5px]">{s.title}</h3>
              </div>
              <p className="mt-1.5 text-[12.5px] text-foreground/75 leading-relaxed">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 rounded-md bg-[#eef4ee] border border-[#d5e5d5] p-4 flex gap-3">
        <ShieldCheck className="h-5 w-5 text-ink shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed">
          <div className="font-semibold text-ink mb-0.5">Safe, Secure & Trusted</div>
          Your security is our priority. We ensure every order is authentic, carefully packed, and delivered with care.
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link to="/shop" className="inline-flex items-center h-10 px-5 rounded bg-ink text-white text-[12.5px] font-semibold">Start Shopping</Link>
        <Link to="/customer-care/faqs" className="inline-flex items-center h-10 px-5 rounded border border-ink text-ink text-[12.5px] font-semibold">Read FAQs</Link>
      </div>
    </CustomerCareScaffold>
  );
}
