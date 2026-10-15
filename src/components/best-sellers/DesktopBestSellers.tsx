import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { DesktopFilterButton } from "@/components/shop/DesktopFilterBar";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";
import wordmarkBlack from "@/assets/ASL_wordmark_black.png.asset.json";

const PER_PAGE = 12;
import { sortOptions } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

export function DesktopBestSellers() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { products: displayed, meta } = useStoreProducts({
    preset: "best-sellers",
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
  const activeSortLabel = sort === "popular" ? "Popular" : sortOptions.find((s) => s.id === sort)?.label ?? "Popular";

  return (
    <DesktopShell active="New In">
      <div className="mx-auto max-w-[1600px] px-6 pt-4 pb-6">
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">Best Sellers</span>
        </nav>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-end justify-between mb-4">
          <div>
            <img src={wordmarkBlack.url} alt="ASL ORIGINALS" className="h-[22px] w-auto object-contain mb-2" />
            <p className="text-[13px] text-muted-foreground mt-1">Our most loved pieces. Handpicked by you.</p>
          </div>
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
                    {[{ id: "popular", label: "Popular" }, ...sortOptions].map((s) => (
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

        <div className="text-xs text-muted-foreground mb-2">{filteredProducts.length} items</div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-6"
        >
          {displayed.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
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
    </DesktopShell>
  );
}
