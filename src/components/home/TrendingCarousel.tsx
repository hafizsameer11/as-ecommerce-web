import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/shop/ProductCard";
import { fadeInUp } from "@/lib/motion";
import { useStoreProducts } from "@/lib/catalog-query";

export function TrendingCarousel({ limit = 10 }: { limit?: number }) {
  const scroller = useRef<HTMLDivElement>(null);
  const { products } = useStoreProducts({ preset: "trending", pageSize: limit });

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="px-4 py-5 md:px-6 md:py-10"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <h2 className="text-sm md:text-xl font-display font-bold tracking-widest uppercase">
            Trending Now
          </h2>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollBy(-1)}
                aria-label="Scroll left"
                className="h-8 w-8 grid place-items-center rounded-full border border-border hover:border-ink/40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollBy(1)}
                aria-label="Scroll right"
                className="h-8 w-8 grid place-items-center rounded-full border border-border hover:border-ink/40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link to="/trending" className="text-xs text-muted-foreground hover:text-foreground">
              View all ›
            </Link>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
        >
          {products.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[42%] sm:w-[28%] md:w-[18%]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
