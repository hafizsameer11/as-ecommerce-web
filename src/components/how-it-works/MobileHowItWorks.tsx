import { MobileShell } from "@/components/shell/MobileShell";
import { motion } from "framer-motion";
import { goToLabel } from "@/lib/nav-resolve";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { steps } from "./howItWorksData";

const GOLD = "#cc5000";

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const },
  { id: "request", label: "", Icon: Plus, center: true },
  { id: "track", label: "Track", Icon: MapPin },
  { id: "account", label: "Account", Icon: User },
];

export function MobileHowItWorks() {
  const navigate = useNavigate();
  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop" onBack={() => window.history.back()}>
      <div className="bg-[#edebdf] pb-4">

      {/* Breadcrumb */}
      <div className="px-4 pt-4 text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-ink">Home</Link>
        <span className="mx-1.5">›</span>
        <Link to="/concierge-service" className="hover:text-ink">Concierge Service</Link>
        <span className="mx-1.5">›</span>
        <span className="text-ink">How It Works</span>
      </div>

      {/* Title */}
      <section className="px-4 pt-5 pb-4 text-center">
        <div className="font-display text-[10px] font-semibold tracking-[0.3em] text-gold mb-2">HOW IT WORKS</div>
        <h1 className="font-display font-medium text-[28px] leading-tight tracking-[0.02em] text-ink">SIMPLE. PERSONAL. PREMIUM.</h1>
        <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Our fashion concierge service is designed for customers looking for exclusive, limited, sold-out or upcoming fashion pieces.<br />
          Here's how we make it happen for you.
        </p>
      </section>

      {/* Steps stacked */}
      <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="px-4 mt-2 space-y-3">
        {steps.map((s) => (
          <motion.div key={s.n} variants={staggerItem} className="bg-white rounded-xl border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-4 flex items-start gap-4">
            <div className="relative shrink-0">
              <div className="h-14 w-14 rounded-full bg-ink grid place-items-center">
                <s.Icon className="h-6 w-6" style={{ color: GOLD }} strokeWidth={1.5} />
              </div>
              <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-ink text-[10px] font-bold grid place-items-center border-2 border-white" style={{ backgroundColor: GOLD }}>{s.n}</div>
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="text-[12px] font-bold tracking-[0.12em] text-ink">{s.title}</div>
              <div className="mt-1.5 text-[11.5px] text-muted-foreground leading-relaxed">{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </motion.section>

      {/* CTA */}
      <section className="px-4 mt-6">
        <motion.button whileTap="tap" variants={buttonTap}
          onClick={() => (window.location.href = "/start-request")}
          className="w-full bg-ink text-white py-3.5 text-[11px] font-semibold tracking-[0.2em] rounded inline-flex items-center justify-center gap-3">
          START YOUR REQUEST NOW <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </section>

      </div>
    </MobileShell>
  );
}
