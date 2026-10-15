import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { type Product } from "@/lib/mock-data";
import { shopProducts, getProductById } from "@/lib/shop-data";
import { ProductCard } from "@/components/shop/ProductCard";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

function resolveShopId(p: Product): string | null {
  const full = "brand" in p && p.brand ? `${p.brand} ${p.name}`.toLowerCase() : p.name.toLowerCase();
  const exact = shopProducts.find((sp) => `${sp.brand} ${sp.name}`.toLowerCase() === full);
  if (exact) return exact.id;
  const tokens = full.split(/\s+/).filter((t) => t.length > 2);
  let best: { id: string; score: number } | null = null;
  for (const sp of shopProducts) {
    const hay = `${sp.brand} ${sp.name}`.toLowerCase();
    const score = tokens.reduce((s, t) => (hay.includes(t) ? s + 1 : s), 0);
    if (score > 0 && (!best || score > best.score)) best = { id: sp.id, score };
  }
  return best?.id ?? null;
}

export function ProductGrid({
  title,
  products,
  viewAllTo,
}: {
  title?: string;
  products: Product[];
  viewAllTo?: "/best-sellers" | "/trending" | "/shop" | "/shop/sales";
}) {
  const t = title?.toLowerCase() ?? "";
  const to = viewAllTo ?? (t.includes("best") ? "/best-sellers" : t.includes("trend") || t.includes("new") ? "/trending" : "/shop");
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
            <Link to={to as any} className="text-xs text-muted-foreground hover:text-foreground">
              View all ›
            </Link>
          </div>
        ) : null}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className={`grid grid-cols-2 gap-2 md:gap-4 ${products.length === 6 ? "md:grid-cols-6" : products.length >= 5 ? "md:grid-cols-5" : "md:grid-cols-4"}`}
        >
          {products.map((p, index) => {
            const shopId = resolveShopId(p);
            const shopProduct = shopId ? getProductById(shopId) : undefined;
            if (!shopProduct) return null;
            const hidesUnpairedMobileCard = products.length % 2 !== 0 && index === products.length - 1;
            return (
              <motion.div
                key={p.id}
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
