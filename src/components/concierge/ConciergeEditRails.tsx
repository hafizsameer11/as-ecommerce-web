import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/shop/ProductCard";
import { type Product } from "@/lib/shop-data";
import { fadeInUp } from "@/lib/motion";
import { useStoreProducts } from "@/lib/catalog-query";

function Rail({
  title,
  eyebrow,
  products,
  to,
  conciergeMode = false,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
  to: string;
  conciergeMode?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="mt-7 px-4 md:px-8"
    >
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-[12px] md:text-xl font-display font-bold tracking-[0.18em] uppercase">{title}</h2>
        <Link to={to} className="text-[10px] md:text-xs font-semibold tracking-[0.15em] text-muted-foreground hover:text-foreground">
          SEE ALL
        </Link>
      </div>
      <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-3">
        {products.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[46%] sm:w-[32%] md:w-[23%] lg:w-[19%]">
            <ProductCard product={p} eyebrow={eyebrow} conciergeMode={conciergeMode} />
          </div>
        ))}
      </div>
    </motion.section>
  );
}

export function ConciergeEditRails({ limit = 10 }: { limit?: number }) {
  const { products: edit } = useStoreProducts({ concierge: true, pageSize: limit, sort: "featured" });
  const { products: newSeason } = useStoreProducts({ preset: "new-arrivals", pageSize: limit });

  return (
    <div className="md:mx-auto md:max-w-[1600px]">
      <Rail
        title="Fashion Concierge Edit"
        eyebrow="Fashion Concierge"
        products={edit}
        to="/collection/fashion-concierge-edit"
        conciergeMode
      />
      <Rail title="New Season" eyebrow="New Season" products={newSeason} to="/collection/new-season" />
    </div>
  );
}
