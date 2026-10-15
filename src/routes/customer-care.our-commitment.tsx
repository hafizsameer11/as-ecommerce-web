import { createFileRoute } from "@tanstack/react-router";
import { Award, Diamond, Users, Lock, Truck, FileCheck, TrendingUp, Star, ShoppingBag, ShieldCheck, Headphones, Sparkles } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import heroImg from "@/assets/care-legal.jpg";

export const Route = createFileRoute("/customer-care/our-commitment")({
  head: () => ({
    meta: [
      { title: "Our Commitment - ASL ORIGINALS" },
      { name: "description", content: "Our commitment to authenticity, quality, transparency, and customer satisfaction." },
    ],
  }),
  component: OurCommitment,
});

const pillars = [
  { Icon: Award, title: "Authentic Products", body: "We source every product from trusted suppliers and carefully inspect each item before it is made available for sale. Our commitment is to provide only genuine products that meet our quality standards." },
  { Icon: Diamond, title: "Premium Quality", body: "We carefully curate every collection to ensure our customers receive premium products from respected global brands. Quality is at the core of everything we offer." },
  { Icon: Users, title: "Customer Satisfaction", body: "Our customers are our priority. We are committed to providing responsive support, clear communication, and professional service before, during, and after every purchase." },
  { Icon: Lock, title: "Secure Shopping", body: "Your privacy and payment information are protected using secure payment technology and encrypted checkout systems. You can shop with confidence knowing your information is handled responsibly." },
  { Icon: Truck, title: "Reliable Delivery", body: "Every order is carefully prepared and packaged before dispatch. We work with trusted delivery partners to ensure your order arrives safely and within the estimated delivery timeframe whenever possible." },
  { Icon: FileCheck, title: "Fair Policies", body: "Our Shipping Policy, Return Policy, Refund Policy, Privacy Policy, and Terms of Service are designed to provide a transparent and fair shopping experience for every customer." },
  { Icon: TrendingUp, title: "Continuous Improvement", body: "We are always looking for ways to improve our website, collections, customer service, and overall shopping experience. Your feedback helps us grow and serve you better." },
];

const promises = [
  { Icon: ShieldCheck, label: "100% Authentic Products" },
  { Icon: Sparkles, label: "Carefully Curated Collections" },
  { Icon: Lock, label: "Secure Payments" },
  { Icon: Truck, label: "Reliable Delivery" },
  { Icon: FileCheck, label: "Transparent Policies" },
  { Icon: Headphones, label: "Dedicated Customer Support" },
  { Icon: Star, label: "A Premium Shopping Experience" },
];

function OurCommitment() {
  return (
    <CustomerCareScaffold
      activeId="our-commitment"
      title="Our Commitment"
      subtitle="At ASL ORIGINALS, every decision we make is guided by our commitment to authenticity, quality, transparency, and customer satisfaction."
    >
      <p className="text-[12.5px] text-foreground/75 leading-relaxed -mt-2">
        We believe shopping for premium fashion should be simple, secure, and trustworthy. From the moment you browse our collections until your order arrives, our goal is to provide an exceptional experience.
      </p>

      <div className="space-y-5">
        {pillars.map((p) => (
          <div key={p.title} className="flex gap-4">
            <div className="shrink-0 h-9 w-9 rounded-full bg-muted grid place-items-center">
              <p.Icon className="h-4 w-4 text-ink" strokeWidth={1.75} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-[13.5px] text-ink">{p.title}</h3>
              <p className="mt-1 text-[12.5px] text-foreground/75 leading-relaxed">{p.body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-ink grid place-items-center">
            <Star className="h-4.5 w-4.5 text-white" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-semibold text-[13.5px] text-ink">Our Promise</div>
            <div className="text-[12px] text-muted-foreground">When you shop with ASL ORIGINALS, you can expect:</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {promises.map((p) => (
            <div key={p.label} className="flex items-center gap-2.5 rounded bg-white border border-border p-3">
              <p.Icon className="h-4 w-4 text-ink shrink-0" strokeWidth={1.75} />
              <span className="text-[12px] text-ink font-medium">{p.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-md border border-border bg-muted/40 p-5 flex items-center gap-5">
        <img src={heroImg} alt="" className="h-[90px] w-[140px] rounded-lg object-cover shrink-0" />
        <div>
          <div className="flex items-center gap-2 font-semibold text-[14px] text-ink">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> Thank You
          </div>
          <p className="mt-1 text-[12px] text-foreground/75 leading-relaxed">
            Thank you for choosing ASL ORIGINALS. Your trust inspires us to continue delivering authenticity, quality, and exceptional service with every order.
          </p>
        </div>
      </div>
    </CustomerCareScaffold>
  );
}
