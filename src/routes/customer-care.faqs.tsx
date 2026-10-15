import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Minus, ShieldCheck } from "lucide-react";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { useStoreFaqs } from "@/lib/faq-store";

export const Route = createFileRoute("/customer-care/faqs")({
  head: () => ({
    meta: [
      { title: "FAQs - ASL ORIGINALS" },
      { name: "description", content: "Answers to the most common questions about shopping with ASL ORIGINALS." },
      { property: "og:title", content: "FAQs - ASL ORIGINALS" },
      { property: "og:description", content: "Answers to the most common questions about shopping with ASL ORIGINALS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FAQsPage,
});

function FAQsPage() {
  const [open, setOpen] = useState<number | null>(0);
  const faqItems = useStoreFaqs((s) => s.items);
  const hydrate = useStoreFaqs((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <CustomerCareScaffold
      activeId="faqs"
      title="FAQs"
      subtitle="Find answers to the most common questions about shopping with ASL ORIGINALS."
    >
      <div className="space-y-2.5">
        {faqItems.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="rounded-md border border-border bg-white">
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
                <span className="text-[12px] text-muted-foreground font-semibold min-w-[20px]">{i + 1}.</span>
                <span className="flex-1 text-[13px] font-medium text-ink">{item.q}</span>
                {isOpen ? <Minus className="h-4 w-4 text-ink" /> : <Plus className="h-4 w-4 text-ink" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-10 text-[12.5px] text-foreground/75 leading-relaxed">{item.a}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md bg-[#eef4ee] border border-[#d5e5d5] p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-ink shrink-0" strokeWidth={1.75} />
        <div className="text-[12.5px] text-foreground/85 leading-relaxed flex-1">
          <div className="font-semibold text-ink">Still have questions?</div>
          Our support team is ready to help you.
        </div>
        <Link to="/customer-care/contact-us" className="text-[12.5px] font-semibold text-ink underline underline-offset-4 whitespace-nowrap">
          Contact Support →
        </Link>
      </div>
    </CustomerCareScaffold>
  );
}
