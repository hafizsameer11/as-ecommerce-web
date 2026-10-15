import { MobileShell } from "@/components/shell/MobileShell";
import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Sparkles, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";
import { getConciergeCategory, getConciergeProducts } from "@/lib/concierge-catalog";
import { staggerContainer, staggerItem, fadeInUp, buttonTap } from "@/lib/motion";

const PER_PAGE = 8;

export function ConciergeCatalog({ categoryId, desktop = false }: { categoryId: string; desktop?: boolean }) {
  const navigate = useNavigate();
  const cat = getConciergeCategory(categoryId);
  const products = getConciergeProducts(categoryId);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const visible = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const body = (
    <div className="min-h-screen bg-background pb-20">
      {/* Header (desktop only - mobile uses the shared shell header) */}
      {desktop && <div className="sticky top-0 z-30 bg-background border-b border-border">
        <div className="mx-auto max-w-[1400px] grid grid-cols-[auto_1fr_auto] items-center px-4 py-3.5 gap-3">
          <button onClick={() => navigate({ to: "/concierge-categories" })} aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Link to="/" className="text-center font-display font-black text-[15px] tracking-[0.18em]">
            ASL ORIGINALS
          </Link>
          <Link to="/start-request" className="text-[10px] font-semibold tracking-[0.14em] text-gold">
            REQUEST
          </Link>
        </div>
      </div>}

      {/* Intro */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp}
        className={`px-4 text-center ${desktop ? "pt-12 pb-8" : "pt-6 pb-5"}`}>
        <div className="font-display text-[10px] font-semibold tracking-[0.3em] text-gold mb-2">
          CONCIERGE SOURCING
        </div>
        <h1 className={`font-display font-medium tracking-tight text-ink ${desktop ? "text-[44px]" : "text-[26px]"}`}>
          {cat?.title ?? "Concierge"}
        </h1>
        <div className="mx-auto mt-2 h-[2px] w-12 bg-gold" />
        <p className={`mt-3 mx-auto text-muted-foreground leading-relaxed ${desktop ? "text-[13.5px] max-w-xl" : "text-[12px]"}`}>
          {cat?.desc ?? "Tell us what you want and we source it for you."} Every piece here is sourced on request - tap any item to send a concierge request instead of adding to cart.
        </p>
      </motion.section>

      {/* Grid */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible"
        className={`mx-auto max-w-[1400px] px-4 grid gap-4 ${desktop ? "grid-cols-4 gap-6" : "grid-cols-2"}`}>
        {visible.map((p) => (
          <motion.div key={p.id} variants={staggerItem} className="relative">
            <span className="absolute top-2 left-2 z-10 bg-ink text-white text-[8.5px] font-semibold tracking-[0.14em] px-2 py-1 rounded-full">
              REQUEST
            </span>
            <ProductCard product={p} conciergeMode showRating />
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {/* Custom request */}
      <section className="mx-auto max-w-[1400px] px-4 mt-10">
        <div className="bg-ink text-white rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-gold text-[10px] font-semibold tracking-[0.24em]">
              <Sparkles className="h-3.5 w-3.5" /> CAN'T FIND IT?
            </div>
            <div className="mt-1.5 font-display font-bold text-[15px]">We source anything, anywhere.</div>
            <div className="text-[11px] text-white/70 mt-1">Send us a link, photo or description and our team takes it from there.</div>
          </div>
          <motion.button whileTap="tap" variants={buttonTap}
            onClick={() => navigate({ to: "/start-request" })}
            className="bg-gold text-ink px-5 py-3 text-[10.5px] font-semibold tracking-[0.15em] rounded inline-flex items-center gap-2 shrink-0">
            START A REQUEST <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </div>
      </section>
    </div>
  );

  if (desktop) return body;
  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop" onBack={() => window.history.back()}>
      {body}
    </MobileShell>
  );
}
