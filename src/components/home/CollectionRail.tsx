import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/shop/ProductCard";
import { fadeInUp } from "@/lib/motion";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import type { ApiCollection } from "@/lib/api/catalog";
import { useCatalogVersion } from "@/lib/catalog-version";

export function CollectionRail({
  collection,
  className,
}: {
  collection: ApiCollection;
  className?: string;
}) {
  useCatalogVersion((s) => s.v);
  const scroller = useRef<HTMLDivElement>(null);
  const products = (collection.products ?? []).map((p) => {
    rememberApiMeta(p);
    return mapApiProduct(p);
  });

  if (!products.length) return null;

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.85), behavior: "smooth" });
  };

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className={className ?? "px-4 py-5 md:px-6 md:py-10"}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-3 flex items-center justify-between md:mb-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-widest md:text-xl">
            {collection.title}
          </h2>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Scroll left"
                className="grid h-8 w-8 place-items-center rounded-full border border-border hover:border-ink/40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="Scroll right"
                className="grid h-8 w-8 place-items-center rounded-full border border-border hover:border-ink/40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link
              to="/collection/$slug"
              params={{ slug: collection.handle }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all ›
            </Link>
          </div>
        </div>

        <div
          ref={scroller}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 md:gap-4"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[18%]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
