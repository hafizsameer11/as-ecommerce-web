import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";

export const Route = createFileRoute("/account/help/$topic")({
  head: ({ params }) => ({ meta: [{ title: `${topicTitle(params.topic)} - ASL ORIGINALS` }] }),
  component: HelpTopic,
});

function topicTitle(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const articles: Record<string, { title: string; body: string }[]> = {
  orders: [
    { title: "How do I track my order?", body: "Every order comes with a tracking number. Go to My Orders and tap 'Track' on the order card to see live delivery updates." },
    { title: "Can I cancel or modify my order?", body: "Orders can be cancelled within 1 hour of purchase. After that, contact support and we'll do our best." },
    { title: "What if my order is delayed?", body: "Delays are rare but happen. Track your parcel or reach us on WhatsApp for a real-time update." },
  ],
  shipping: [
    { title: "How long does delivery take?", body: "Lagos: 1 - 2 business days. Nationwide: 3 - 5 business days. International: 7 - 14 business days." },
    { title: "Do you ship internationally?", body: "Yes. We ship to 40+ countries via DHL Express." },
    { title: "Is shipping free?", body: "Free standard shipping on orders over ₦150,000 in Nigeria." },
  ],
  returns: [
    { title: "What is your return policy?", body: "Return within 14 days of delivery for a full refund. Items must be unworn with tags." },
    { title: "How do I start a return?", body: "Go to My Orders → tap the order → tap 'Return'. We'll email a return label." },
    { title: "When will I get my refund?", body: "Refunds process within 5 - 10 business days after we receive your return." },
  ],
};

function HelpTopic() {
  const { topic } = Route.useParams();
  const nav = useNavigate();
  const list = articles[topic] ?? articles.orders;
  return (
    <>
      <AccountInnerScaffold title={topicTitle(topic)} subtitle="Frequently asked questions" activeId="help" backTo="/account/help">
        <div className="space-y-3">
          {list.map((a, i) => (
            <motion.details key={i} variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 group">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-[14px]">{a.title}</span>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-[13px] text-foreground/75 leading-relaxed">{a.body}</p>
            </motion.details>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-muted/40 p-5 text-center">
          <div className="font-semibold text-[14px]">Still need help?</div>
          <p className="text-[12px] text-muted-foreground mt-1">Our team is one message away.</p>
          <button onClick={() => nav({ to: "/account/help/contact" })} className="mt-3 inline-flex items-center gap-2 bg-ink text-white text-[13px] font-semibold px-4 py-2 rounded-md hover:bg-ink/90">
            Contact Support
          </button>
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
