import { motion } from "framer-motion";
import wordmarkWhite from "@/assets/ASL_wordmark_white.png.asset.json";
import { goToLabel } from "@/lib/nav-resolve";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag, Search, ArrowRight, Star, Gem } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem, buttonTap, cardHover, imageZoom } from "@/lib/motion";
import { conciergeCategories } from "./categoryData";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const },
  { label: "CONCIERGE CATEGORIES", to: "/concierge-categories" as const, active: true },
  { label: "HOW IT WORKS", to: "/how-it-works" as const },
  { label: "TRACK REQUEST", to: "/track-request" as const },
  { label: "FAQ", to: "/faq" as const },
];


export function DesktopCategoriesList() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#edebdf]">
      {/* Black header */}
      <header className="bg-ink text-white sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <img src={wordmarkWhite.url} alt="ASL ORIGINALS" className="h-[16px] w-auto object-contain" />
            <div className="text-[9px] tracking-[0.3em] text-white/60 mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => {
              const cls = `text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-white border-b-2 border-gold pb-5 -mb-[17px]" : "text-white/70 hover:text-white"}`;
              return <Link key={n.label} to={n.to} className={cls}>{n.label}</Link>;
            })}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => goToLabel("Search")} aria-label="Search">
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap}
              onClick={() => (window.location.href = "/start-request")}
              className="bg-gold hover:bg-[#b8944e] text-ink px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded"
            >
              START A REQUEST
            </motion.button>
          </div>
        </div>
      </header>

      {/* Title */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="pt-14 pb-10 text-center px-6">
        <div className="font-display text-[11px] font-semibold tracking-[0.3em] text-gold mb-3">CONCIERGE CATEGORIES</div>
        <h1 className="font-display font-medium text-[52px] leading-[1.05] tracking-tight text-ink">What You Can Request</h1>
        <div className="mx-auto mt-3 h-[2px] w-16 bg-gold" />
        <p className="mt-5 text-[13.5px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Request any fashion item you want. From exclusive pieces to sold-out items, we source it for you.
        </p>
      </motion.section>

      {/* Grid */}
      <section className="px-6 pb-12">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="mx-auto max-w-[1600px] grid grid-cols-4 gap-6">
          {conciergeCategories.map((c) => (
            <motion.button key={c.id} variants={staggerItem} initial="rest" whileHover="hover" whileTap="tap"
              onClick={() => c.starIcon ? navigate({ to: "/start-request" }) : navigate({ to: "/concierge-shop/$category", params: { category: c.id } })}
              className="text-left group">
              <motion.div variants={cardHover} className="rounded-xl bg-white overflow-hidden border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#ecebe6]">
                  {c.starIcon ? (
                    <div className="absolute inset-0 grid place-items-center">
                      <Star className="h-16 w-16 text-gold" strokeWidth={1.25} />
                    </div>
                  ) : (
                    <motion.img variants={imageZoom} src={c.img} alt={c.title}
                      className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                  )}
                </div>
                <div className="p-5">
                  <div className="font-display font-bold text-[16px] text-ink">{c.title}</div>
                  <p className="mt-1.5 text-[12px] text-muted-foreground leading-snug">{c.desc}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink group-hover:text-gold transition">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </motion.div>
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* Custom request banner */}
      <section className="px-6 pb-14">
        <div className="mx-auto max-w-[1600px] bg-ink text-white rounded-xl px-8 py-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-full border border-gold grid place-items-center shrink-0">
              <Gem className="h-5 w-5 text-gold" strokeWidth={1.5} />
            </div>
            <div>
              <div className="font-display font-bold text-[17px] tracking-[0.1em]">Can't find what you're looking for?</div>
              <div className="text-[12px] text-white/70 mt-1">Submit a custom request and our team will source it for you.</div>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
            onClick={() => goToLabel("Submit Custom Request")}
            className="bg-gold hover:bg-[#b8944e] text-ink px-6 py-3 text-[11px] font-semibold tracking-[0.15em] rounded inline-flex items-center gap-2 shrink-0">
            SUBMIT CUSTOM REQUEST <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </section>
    </div>
  );
}
