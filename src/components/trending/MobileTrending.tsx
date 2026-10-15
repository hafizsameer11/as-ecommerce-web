import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { MobileShell } from "@/components/shell/MobileShell";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";

const PER_PAGE = 12;
import { ProductFilters, defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { sortOptions } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import { staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

export function MobileTrending() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.body.style.overflow = filterOpen || sortOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen, sortOpen]);

  const { products: displayed, meta } = useStoreProducts({
    preset: "trending",
    filters,
    sort,
    page,
    pageSize: PER_PAGE,
  });
  const filtered = { length: meta.total ?? displayed.length };

  useEffect(() => { setPage(1); }, [filters, sort]);

  const totalPages = Math.max(1, meta.pageCount ?? 1);
  const currentPage = Math.min(page, totalPages);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * PER_PAGE, filtered.length);
  const sortLabel = sort === "popular" ? "Popular" : sortOptions.find((s) => s.id === sort)?.label ?? "Popular";

  return (
    <MobileShell
      activeBottom="shop"
      headerVariant="category"
      showTopTabs={false}
      title="TRENDING NOW"
      showSearchInHeader
      onBack={() => window.history.back()}
    >
      <div className="min-h-screen bg-background pb-8">
        <div className="px-4 pt-3 pb-2">
          <p className="text-[13px] text-muted-foreground">See what's hot right now.</p>
        </div>

        <div className="flex items-center justify-between px-4 pb-3">
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 border border-border rounded-[3px] px-4 py-2 text-[12px] font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </motion.button>
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => setSortOpen(true)}
            className="flex items-center gap-2 text-[12px]"
          >
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-semibold">{sortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 px-4"
        >
          {displayed.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} trendingBadge />
            </motion.div>
          ))}
        </motion.div>

        {displayed.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm px-4">No products match your filters.</div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 mt-6">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}

        {/* Filter Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-x-0 bottom-0 h-[92vh] z-50 bg-background flex flex-col rounded-t-[28px] overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.25)]"
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5 border-b border-border">
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setFilterOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                  </motion.button>
                  <h2 className="text-center text-sm font-display font-bold tracking-widest uppercase">Filters</h2>
                  <button
                    onClick={() => setFilters(defaultFilters)}
                    className="text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  <ProductFilters filters={filters} onChange={setFilters} showReset={false} />
                </div>
                <div className="p-3 border-t border-border">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full py-3.5 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]"
                  >
                    Apply Filters
                  </button>
                  <div className="text-center text-[11px] text-muted-foreground mt-2">
                    {filtered.length} items
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sort Drawer */}
        <AnimatePresence>
          {sortOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSortOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-xl"
              >
                <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-display font-bold tracking-widest uppercase">Sort By</h2>
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setSortOpen(false)}>
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="py-2 pb-6">
                  {[{ id: "popular", label: "Popular" }, ...sortOptions].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSort(s.id); setSortOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-3 text-left text-[13px] hover:bg-muted"
                    >
                      {s.label}
                      {sort === s.id && <div className="h-2 w-2 rounded-full bg-ink" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MobileShell>
  );
}
