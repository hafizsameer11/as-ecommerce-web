import { useEffect, useState } from "react";
import wordmarkWhite from "@/assets/ASL_wordmark_white.png";
import { goToLabel } from "@/lib/nav-resolve";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag, Search, User, MessageCircle, Mail } from "lucide-react";
import { buttonTap } from "@/lib/motion";
import { useStoreFaqs } from "@/lib/faq-store";

const WhatsAppIcon = ({ className }: { className?: string; strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);
import { faqTrust } from "./faqData";
import helpImg from "@/assets/faq-help.jpg";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const },
  { label: "CATEGORIES", to: "/concierge-categories" as const },
  { label: "HOW IT WORKS", to: "/how-it-works" as const },
  { label: "TRACK REQUEST", to: "/track-request" as const },
  { label: "FAQ", to: "/faq" as const, active: true },
];

const GOLD = "#cc5000";

export function DesktopFAQ() {
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<number | null>(0);
  const faqItems = useStoreFaqs((s) => s.items);
  const faqCategories = useStoreFaqs((s) => s.categories);
  const hydrate = useStoreFaqs((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  const filtered = cat === "all" ? faqItems : faqItems.filter((f) => f.category === cat);
  const mid = Math.ceil(filtered.length / 2);
  const cols = [filtered.slice(0, mid), filtered.slice(mid)];

  return (
    <div className="min-h-screen bg-[#edebdf]">
      <header className="bg-ink text-white sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <img src={wordmarkWhite} alt="ASL ORIGINALS" className="h-[16px] w-auto object-contain" />
            <div className="text-[9px] tracking-[0.3em] text-white/60 mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => (
              <Link key={n.label} to={n.to} className={`text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-white border-b-2 border-gold pb-5 -mb-[17px]" : "text-white/70 hover:text-white"}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => goToLabel("Search")} aria-label="Search"><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Account")} aria-label="Account"><User className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <Link to="/start-request">
              <motion.span whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap} className="inline-block bg-gold text-ink px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded">
                START A REQUEST
              </motion.span>
            </Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1600px] px-6 pt-6 text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">FAQ</span>
      </div>

      {/* Title */}
      <section className="mx-auto max-w-[1100px] px-6 pt-10 pb-8 text-center">
        <div className="text-[11px] font-semibold tracking-[0.35em]" style={{ color: GOLD }}>FAQ</div>
        <h1 className="font-display text-[52px] leading-[1.05] mt-3 tracking-wide">FREQUENTLY ASKED QUESTIONS</h1>
        <div className="mx-auto mt-4 h-[2px] w-16" style={{ background: GOLD }} />
        <p className="mt-5 text-[13.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Find answers to the most common questions about our Fashion Concierge service.<br />
          If you need more help, our team is always here for you.
        </p>
      </section>

      {/* Category tabs */}
      <section className="mx-auto max-w-[1400px] px-6">
        <div className="flex items-center justify-center flex-wrap gap-2">
          {faqCategories.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setCat(c.id); setOpen(null); }}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded text-[11px] font-semibold tracking-[0.15em] transition ${active ? "bg-ink text-white" : "text-ink/70 hover:text-ink"}`}
              >
                <c.Icon className="h-4 w-4" strokeWidth={1.75} />
                {c.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Two-column accordion */}
      <section className="mx-auto max-w-[1400px] px-6 mt-8 grid grid-cols-2 gap-6">
        {cols.map((col, ci) => (
          <div key={ci} className="space-y-3">
            {col.map((item, i) => {
              const idx = ci * mid + i;
              const isOpen = open === idx;
              return (
                <div key={item.q} className="bg-white rounded-md border border-black/5">
                  <button onClick={() => setOpen(isOpen ? null : idx)} className="w-full flex items-center gap-3 px-5 py-4 text-left">
                    <item.Icon className="h-4 w-4 shrink-0 text-ink/70" strokeWidth={1.75} />
                    <span className="flex-1 text-[13px] text-ink">{item.q}</span>
                    <span className="text-lg text-ink/60 leading-none">{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                        <div className="px-5 pb-4 pl-12 text-[12.5px] text-muted-foreground leading-relaxed">{item.a}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ))}
      </section>

      {/* Still need help */}
      <section className="mx-auto max-w-[1400px] px-6 mt-14">
        <div className="bg-[#f5efe4] rounded-md overflow-hidden grid grid-cols-[260px_1fr] items-stretch">
          <img src={helpImg} alt="Concierge support" loading="lazy" width={1024} height={768} className="h-full w-full object-cover" />
          <div className="px-10 py-8 flex flex-col justify-center gap-6">
            <div>
              <h3 className="font-display text-[28px] leading-tight">Still need help?</h3>
              <p className="text-[12.5px] text-muted-foreground mt-1.5">Our concierge team is ready to assist you with anything you need.</p>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => goToLabel("Chat")} className="flex items-center gap-3 text-left pr-6">
                <MessageCircle className="h-6 w-6 text-ink" strokeWidth={1.5} />
                <div>
                  <div className="text-[12.5px] font-semibold">Chat with Concierge</div>
                  <div className="text-[11px] text-muted-foreground">We're here to help you.</div>
                </div>
              </button>
              <div className="w-px h-10 bg-black/10" />
              <button onClick={() => goToLabel("WhatsApp")} className="flex items-center gap-3 text-left px-6">
                <WhatsAppIcon className="h-6 w-6 text-ink" strokeWidth={1.5} />
                <div>
                  <div className="text-[12.5px] font-semibold">WhatsApp Support</div>
                  <div className="text-[11px] text-muted-foreground">Message us on WhatsApp.</div>
                </div>
              </button>
              <div className="w-px h-10 bg-black/10" />
              <button onClick={() => goToLabel("Email")} className="flex items-center gap-3 text-left px-6">
                <Mail className="h-6 w-6 text-ink" strokeWidth={1.5} />
                <div>
                  <div className="text-[12.5px] font-semibold">Email Support</div>
                  <div className="text-[11px] text-muted-foreground">customerservice@asloriginals.com</div>
                </div>
              </button>
              <div className="w-px h-10 bg-black/10" />
              <button onClick={() => goToLabel("Contact")} className="border border-ink text-ink px-7 py-3 text-[11px] font-semibold tracking-[0.15em] rounded hover:bg-ink hover:text-white transition">
                CONTACT US
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dark trust bar */}
      <section className="bg-ink text-white mt-14">
        <div className="mx-auto max-w-[1600px] px-6 py-10 grid grid-cols-4 gap-8">
          {faqTrust.map((t) => (
            <div key={t.title} className="flex items-start gap-4">
              <t.Icon className="h-8 w-8 shrink-0" style={{ color: GOLD }} strokeWidth={1.5} />
              <div>
                <div className="text-[12px] font-semibold tracking-[0.15em]">{t.title}</div>
                <div className="text-[11.5px] text-white/60 mt-1.5 leading-relaxed">{t.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
