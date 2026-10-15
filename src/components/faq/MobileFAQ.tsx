import { MobileShell } from "@/components/shell/MobileShell";
import { useEffect, useState } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, MessageCircle, Mail } from "lucide-react";
import { useStoreFaqs } from "@/lib/faq-store";
import helpImg from "@/assets/faq-help.jpg";

const GOLD = "#cc5000";

const WhatsAppLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const },
  { id: "request", label: "Request", Icon: Plus, center: true, to: "/start-request" as const },
  { id: "track", label: "Track", Icon: MapPin, to: "/track-request" as const },
  { id: "account", label: "Account", Icon: User },
];

export function MobileFAQ() {
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const faqItems = useStoreFaqs((s) => s.items);
  const faqCategories = useStoreFaqs((s) => s.categories);
  const hydrate = useStoreFaqs((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const filtered = cat === "all" ? faqItems : faqItems.filter((f) => f.category === cat);

  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop">
      <div className="bg-[#edebdf] pb-4">

      {/* Breadcrumb */}
      <div className="px-4 pt-4 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">FAQ</span>
      </div>

      {/* Title */}
      <section className="px-4 pt-5 pb-4 text-center">
        <div className="text-[10px] font-semibold tracking-[0.35em]" style={{ color: GOLD }}>FAQ</div>
        <h1 className="font-display text-[26px] leading-tight mt-2 tracking-wide">FREQUENTLY ASKED QUESTIONS</h1>
        <div className="mx-auto mt-3 h-[2px] w-12" style={{ background: GOLD }} />
        <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Find answers to the most common questions<br />
          about our Fashion Concierge service.<br />
          If you need more help, our team is always here for you.
        </p>
      </section>

      {/* Category tabs */}
      <div className="px-3">
        <div className="grid grid-cols-6 gap-1.5">
          {faqCategories.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCat(c.id); setOpen(null); }}
                className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded ${active ? "bg-ink text-white" : "bg-white text-ink/70"}`}
              >
                <c.Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                <span className="text-[8.5px] font-semibold tracking-[0.1em]">{c.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion */}
      <section className="px-3 mt-4 space-y-2">
        {filtered.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="bg-white rounded-md border border-black/5">
              <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center gap-2.5 px-3.5 py-3.5 text-left">
                <item.Icon className="h-4 w-4 shrink-0 text-ink/70" strokeWidth={1.75} />
                <span className="flex-1 text-[12.5px] text-ink">{item.q}</span>
                <span className="text-base text-ink/60 leading-none">{isOpen ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-3.5 pb-3.5 pl-9 text-[11.5px] text-muted-foreground leading-relaxed">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </section>

      {/* Still need help */}
      <section className="px-3 mt-6">
        <div className="bg-[#f5efe4] rounded-md p-5 text-center">
          <h3 className="font-display text-[20px] leading-tight">Still need help?</h3>
          <p className="text-[11.5px] text-muted-foreground mt-1.5">Our concierge team is ready to assist you.</p>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={() => goToLabel("Chat")} className="bg-white rounded py-3 flex flex-col items-center gap-1.5">
              <MessageCircle className="h-5 w-5 text-ink" strokeWidth={1.5} />
              <span className="text-[10.5px] font-semibold">Chat</span>
            </button>
            <button onClick={() => goToLabel("WhatsApp")} className="bg-white rounded py-3 flex flex-col items-center gap-1.5">
              <WhatsAppLogo className="h-5 w-5 text-ink" />
              <span className="text-[10.5px] font-semibold">WhatsApp</span>
            </button>
            <button onClick={() => goToLabel("Email")} className="bg-white rounded py-3 flex flex-col items-center gap-1.5">
              <Mail className="h-5 w-5 text-ink" strokeWidth={1.5} />
              <span className="text-[10.5px] font-semibold">Email</span>
            </button>
          </div>
          <button onClick={() => goToLabel("Contact")} className="mt-3 w-full bg-ink text-white py-3 text-[11px] font-semibold tracking-[0.15em] rounded">
            CONTACT US
          </button>
        </div>
      </section>

      </div>
    </MobileShell>
  );
}
