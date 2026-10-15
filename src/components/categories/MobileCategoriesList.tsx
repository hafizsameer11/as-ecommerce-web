import { MobileShell } from "@/components/shell/MobileShell";
import { motion } from "framer-motion";
import { goToLabel } from "@/lib/nav-resolve";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, Star, ArrowRight } from "lucide-react";
import { staggerContainer, staggerItem, cardHover, imageZoom, buttonTap } from "@/lib/motion";
import { conciergeCategories } from "./categoryData";

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const, active: true },
  { id: "request", label: "", Icon: Plus, center: true },
  { id: "track", label: "Track", Icon: MapPin },
  { id: "account", label: "Account", Icon: User },
];

export function MobileCategoriesList() {
  const navigate = useNavigate();
  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop">
      <div className="bg-[#edebdf] pb-4">

      {/* Title */}
      <section className="px-4 pt-5 pb-4 text-center">
        <div className="font-display text-[10px] font-semibold tracking-[0.3em] text-gold mb-2">CONCIERGE CATEGORIES</div>
        <h1 className="font-display font-medium text-[26px] tracking-tight text-ink">What You Can Request</h1>
        <div className="mx-auto mt-2 h-[2px] w-12 bg-gold" />
        <p className="mt-3 text-[12px] text-muted-foreground leading-relaxed">
          Request any fashion item you want. From exclusive pieces to sold-out items, we source it for you.
        </p>
      </section>

      {/* Grid */}
      <motion.section variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
        className="px-3 grid grid-cols-2 gap-3">
        {conciergeCategories.map((c) => (
          <motion.button key={c.id} variants={staggerItem} initial="rest" whileTap="tap"
            onClick={() => c.starIcon ? navigate({ to: "/start-request" }) : navigate({ to: "/concierge-shop/$category", params: { category: c.id } })}
            className="text-left group">
            <motion.div variants={cardHover} className="rounded-xl bg-white overflow-hidden border border-black/5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#ecebe6]">
                {c.starIcon ? (
                  <div className="absolute inset-0 grid place-items-center">
                    <Star className="h-12 w-12 text-gold" strokeWidth={1.25} />
                  </div>
                ) : (
                  <motion.img variants={imageZoom} src={c.img} alt={c.title}
                    className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                )}
              </div>
              <div className="p-3">
                <div className="font-display font-bold text-[13px] text-ink leading-tight">{c.title}</div>
                <p className="mt-1 text-[10.5px] text-muted-foreground leading-snug line-clamp-2">{c.desc}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10.5px] font-semibold text-ink">
                  Explore <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </motion.div>
          </motion.button>
        ))}
      </motion.section>

      {/* Custom request banner */}
      <section className="px-3 mt-6">
        <div className="bg-ink text-white rounded-xl p-4">
          <div className="text-[13px] font-display font-bold tracking-[0.05em]">Can't find what you're looking for?</div>
          <div className="text-[10.5px] text-white/70 mt-1">Submit a custom request and our team will source it for you.</div>
          <motion.button whileTap="tap" variants={buttonTap}
            onClick={() => goToLabel("Submit Custom Request")}
            className="mt-3 w-full bg-gold text-ink py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded">
            SUBMIT CUSTOM REQUEST
          </motion.button>
        </div>
      </section>

      </div>
    </MobileShell>
  );
}
