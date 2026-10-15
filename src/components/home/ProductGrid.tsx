import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { type Product as TeaserProduct } from "@/lib/mock-data";
import { getProductById, type Product } from "@/lib/shop-data";
import { ProductCard } from "@/components/shop/ProductCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { useCatalogVersion } from "@/lib/catalog-version";

function resolveProduct(p: TeaserProduct): Product | undefined {
  return getProductById(p.id);
}

export function ProductGrid({
  title,
  products,
  viewAllTo,
}: {
  title?: string;
  products: TeaserProduct[];
  viewAllTo?: "/best-sellers" | "/trending" | "/shop" | "/shop/sales";
}) {
  useCatalogVersion((s) => s.v);

  const t = title?.toLowerCase() ?? "";
  const to = viewAllTo ?? (t.includes("best") ? "/best-sellers" : t.includes("trend") || t.includes("new") ? "/trending" : "/shop");

  const resolved = products.map((p) => resolveProduct(p)).filter((p): p is Product => !!p);
  if (resolved.length === 0) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className={title ? "px-4 py-5 md:px-6 md:py-10" : "px-4 pb-5 pt-2 md:px-6 md:pb-10 md:pt-3"}
    >
      <div className="mx-auto max-w-[1600px]">
        {title ? (
          <div className="flex items-center justify-between mb-3 md:mb-6">
            <h2 className="text-sm md:text-xl font-display font-bold tracking-widest uppercase">
              {title}
            </h2>
            <Link to={to as "/best-sellers"} className="text-xs text-muted-foreground hover:text-foreground">
              View all ›
            </Link>
          </div>
        ) : null}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className={`grid grid-cols-2 gap-2 md:gap-4 ${resolved.length === 6 ? "md:grid-cols-6" : resolved.length >= 5 ? "md:grid-cols-5" : "md:grid-cols-4"}`}
        >
          {resolved.map((shopProduct, index) => {
            const hidesUnpairedMobileCard = resolved.length % 2 !== 0 && index === resolved.length - 1;
            return (
              <motion.div
                key={shopProduct.id}
                variants={staggerItem}
                className={hidesUnpairedMobileCard ? "max-md:hidden" : ""}
              >
                <ProductCard product={shopProduct} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </motion.section>
  );
}
