import { motion } from "framer-motion";
import { goToLabel } from "@/lib/nav-resolve";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingBag, Search, ArrowRight } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { steps, trust, requestCats } from "./howItWorksData";

const GOLD = "#cc5000";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const },
  { label: "CATEGORIES", to: "/concierge-categories" as const },
  { label: "HOW IT WORKS", active: true },
  { label: "TRACK REQUEST", to: "/track-request" as const },
  { label: "FAQ" },
];

export function DesktopHowItWorks() {
  return (
    <div className="min-h-screen bg-[#edebdf]">
      {/* Black header */}
      <header className="bg-ink text-white sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <div className="font-display font-bold text-lg tracking-[0.18em] leading-none">ASL ORIGINALS</div>
            <div className="text-[9px] tracking-[0.3em] text-white/60 mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => {
              const cls = `text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-white border-b-2 border-gold pb-5 -mb-[17px]" : "text-white/70 hover:text-white"}`;
              if (n.to) return <Link key={n.label} to={n.to} className={cls}>{n.label}</Link>;
              return <button key={n.label} onClick={() => goToLabel(n.label)} className={cls}>{n.label}</button>;
            })}
          </nav>
          <div className="flex items-center gap-5">
            <button onClick={() => goToLabel("Search")} aria-label="Search"><Search className="h-5 w-5" strokeWidth={1.5} /></button>
            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-gold text-ink text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap}
              onClick={() => (window.location.href = "/start-request")}
              className="bg-gold hover:bg-[#b8944e] text-ink px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded">
              START A REQUEST
            </motion.button>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1600px] px-6 pt-6 text-[12px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-2">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-2">›</span>
        <span className="text-ink">How It Works</span>
      </div>

      {/* Title */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="pt-10 pb-8 text-center px-6">
        <div className="font-display text-[11px] font-semibold tracking-[0.32em] text-gold mb-4">HOW IT WORKS</div>
        <h1 className="font-display font-medium text-[64px] leading-[1.02] tracking-[0.02em] text-ink">SIMPLE. PERSONAL. PREMIUM.</h1>
        <p className="mt-5 text-[13.5px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Our fashion concierge service is designed for customers looking for exclusive,<br />
          limited, sold-out or upcoming fashion pieces.<br />
          Here's how we make it happen for you.
        </p>
      </motion.section>

      {/* Steps */}
      <section className="px-6 pt-6 pb-14">
        <div className="mx-auto max-w-[1500px] relative">
          {/* horizontal connector between the icon circles */}
          <div className="absolute left-[8%] right-[8%] top-[46px] border-t border-dashed border-black/20" aria-hidden />
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="relative grid grid-cols-6 gap-6">
            {steps.map((s) => (
              <motion.div key={s.n} variants={staggerItem} className="flex flex-col items-center text-center">
                <div className="flex flex-col items-center">
                  <div className="h-[92px] w-[92px] rounded-full bg-ink grid place-items-center relative z-10">
                    <s.Icon className="h-9 w-9" style={{ color: GOLD }} strokeWidth={1.5} />
                  </div>
                  {/* vertical line from the circle down to the step number */}
                  <div className="h-7 w-px bg-ink/20" />
                  <div className="h-6 w-6 rounded-full text-ink text-[11px] font-bold grid place-items-center border-2 border-white" style={{ backgroundColor: GOLD }}>{s.n}</div>
                </div>
                <div className="mt-6 text-[12px] font-bold tracking-[0.12em] text-ink">{s.title}</div>
                <div className="mt-2 text-[11.5px] text-muted-foreground leading-relaxed max-w-[180px]">{s.sub}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="px-6 pb-14">
        <div className="mx-auto max-w-[1500px] border-y border-black/10 py-8 grid grid-cols-5 gap-6">
          {trust.map(({ Icon, title, sub }) => (
            <div key={title} className="flex flex-col items-center text-center px-3">
              <div className="h-10 w-10 rounded-full border border-ink grid place-items-center mb-3">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-ink">{title}</div>
              <div className="mt-1.5 text-[11px] text-muted-foreground leading-snug">{sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What You Can Request - dark band */}
      <section className="bg-ink text-white px-6 py-14">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gold/60" />
            <h2 className="font-display font-bold text-[16px] tracking-[0.35em]">WHAT YOU CAN REQUEST</h2>
            <div className="h-px w-16 bg-gold/60" />
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-7 gap-4">
            {requestCats.map(({ img, label }) => (
              <motion.button key={label} variants={staggerItem} whileHover={{ y: -3 }} whileTap="tap"
                onClick={() => goToLabel(label.replace("\n", " "))}
                className="text-left">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-white/5">
                  <img src={img} alt={label.replace("\n", " ")}
                    className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="mt-3 text-[10.5px] font-bold tracking-[0.14em] whitespace-pre-line leading-tight">{label}</div>
              </motion.button>
            ))}
          </motion.div>

          <div className="mt-12 flex justify-center">
            <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
              onClick={() => (window.location.href = "/start-request")}
              className="border-2 border-gold text-white px-10 py-3.5 text-[11px] font-semibold tracking-[0.22em] rounded inline-flex items-center gap-3 hover:bg-gold hover:text-ink transition"
              style={{ color: GOLD }}>
              <span style={{ color: GOLD }} className="hover:text-ink">START YOUR REQUEST NOW</span>
              <ArrowRight className="h-3.5 w-3.5" style={{ color: GOLD }} />
            </motion.button>
          </div>
        </div>
      </section>
    </div>
  );
}
