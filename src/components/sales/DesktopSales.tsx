import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { BadgeCheck, Truck, Shield, RefreshCcw } from "lucide-react";
import { defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { DesktopFilterButton } from "@/components/shop/DesktopFilterBar";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";

const PER_PAGE = 12;
import { sortOptions } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { SalesHero } from "./SalesHero";


export function DesktopSales() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  
  const [sort, setSort] = useState("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { products: displayed, meta } = useStoreProducts({
    preset: "sales",
    onSale: true,
    filters,
    sort,
    page,
    pageSize: PER_PAGE,
  });
  const filteredProducts = { length: meta.total ?? displayed.length };

  useEffect(() => { setPage(1); }, [filters, sort]);

  const totalPages = Math.max(1, meta.pageCount ?? 1);
  const currentPage = Math.min(page, totalPages);
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * PER_PAGE, filteredProducts.length);
  const activeSortLabel =
    sort === "featured" ? "Featured" : sortOptions.find((s) => s.id === sort)?.label ?? "Featured";

  return (
    <DesktopShell active="Sale">
      <div className="mx-auto max-w-[1600px] px-6 pt-4">
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">Sales</span>
        </nav>

        <SalesHero />


        <div className="mt-5 pb-6">
          <div className="min-w-0">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] text-muted-foreground">
                Showing <span className="text-ink font-semibold">{rangeStart} - {rangeEnd}</span> of {filteredProducts.length} products
              </h2>
              <div className="flex items-center gap-2">
              <DesktopFilterButton filters={filters} onChange={setFilters} resultCount={filteredProducts.length} />
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-[12px] border border-border px-3 py-2 rounded-[3px] hover:border-ink/40"
                >
                  Sort by: {activeSortLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-[3px] shadow-lg z-20 py-1">
                    {[{ id: "featured", label: "Featured" }, ...sortOptions].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSort(s.id); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-[12px] hover:bg-muted ${sort === s.id ? "font-semibold" : ""}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-5">
              {displayed.map((p) => (
                <motion.div key={p.id} variants={staggerItem}>
                  <ProductCard product={p} saleMode />
                </motion.div>
              ))}
            </motion.div>

            {displayed.length === 0 && (
              <div className="py-20 text-center text-muted-foreground text-sm">No products match your filters.</div>
            )}

            {filteredProducts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card">
        <div className="mx-auto max-w-[1600px] px-6 grid grid-cols-4 divide-x divide-border">
          {[
            { Icon: BadgeCheck, title: "100% Original Products", sub: "Authentic or your money back" },
            { Icon: Truck, title: "Fast Delivery", sub: "2 - 5 working days delivery" },
            { Icon: Shield, title: "Secure Payment", sub: "100% secure checkout" },
            { Icon: RefreshCcw, title: "Easy Returns", sub: "7 days return policy" },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 px-5 py-4">
              <Icon className="h-5 w-5 shrink-0 text-foreground" strokeWidth={1.5} />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold tracking-wider uppercase leading-tight">{title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DesktopShell>
  );
}
