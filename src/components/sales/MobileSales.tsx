import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ChevronRight, Percent, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { ProductFilters, defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";

const PER_PAGE = 12;
import { sortOptions, categories, getSubcategoryThumbnail } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import { staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { SalesHero } from "./SalesHero";

const saleCategories = [
  { id: "all", name: "All Sales" },
  { id: "new-arrivals", name: "New Arrivals" },
  { id: "clothing", name: "Clothing" },
  { id: "footwear", name: "Footwear" },
  { id: "accessories", name: "Accessories" },
  { id: "fragrances", name: "Fragrances" },
];

export function MobileSales() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeCat, setActiveCat] = useState("all");
  const [sort, setSort] = useState("featured");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.body.style.overflow = filterOpen || sortOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [filterOpen, sortOpen]);

  const { products: displayed, meta } = useStoreProducts({
    preset: activeCat === "new-arrivals" ? "new-arrivals" : "sales",
    category: activeCat !== "all" && activeCat !== "new-arrivals" ? activeCat : undefined,
    onSale: true,
    filters,
    sort,
    page,
    pageSize: PER_PAGE,
  });
  const filteredProducts = { length: meta.total ?? displayed.length };

  useEffect(() => { setPage(1); }, [filters, sort, activeCat]);

  const totalPages = Math.max(1, meta.pageCount ?? 1);
  const currentPage = Math.min(page, totalPages);
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * PER_PAGE, filteredProducts.length);
  const activeSortLabel =
    sort === "featured" ? "Featured" : sortOptions.find((s) => s.id === sort)?.label ?? "Featured";

  return (
    <MobileShell activeBottom="shop" headerVariant="shop" showTopTabs={false} onBack={() => window.history.back()}>
      <div className="min-h-screen bg-background pb-6">
        <nav className="flex items-center gap-1 text-[10px] text-muted-foreground px-4 pt-2 pb-1">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-ink font-medium">Sales</span>
        </nav>

        <div className="px-4 mt-1">
          <SalesHero compact />
        </div>

        {/* Sale category chips */}
        <div className="mt-3 px-4 py-1 flex items-start gap-3 overflow-x-auto no-scrollbar">
          {saleCategories.map((c) => {
            const active = activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className="flex flex-col items-center gap-1.5 shrink-0 w-[62px]"
              >
                <div
                  className={`h-14 w-14 rounded-full grid place-items-center bg-[#f2f2f2] transition-all ${
                    active ? "ring-2 ring-ink ring-offset-2 ring-offset-background" : "ring-1 ring-border"
                  }`}
                >
                  {c.id === "all" ? (
                    <Percent className="h-5 w-5 text-ink" strokeWidth={1.75} />
                  ) : c.id === "new-arrivals" ? (
                    <Tag className="h-5 w-5 text-ink" strokeWidth={1.75} />
                  ) : (
                    <img
                      src={getSubcategoryThumbnail(c.id, categories.find((x) => x.id === c.id)?.name ?? "") ?? ""}
                      alt={c.name}
                      className="h-9 w-9 object-contain mix-blend-multiply"
                    />
                  )}
                </div>
                <div className={`font-display text-[9px] font-bold uppercase tracking-tight text-center leading-tight ${active ? "text-ink" : "text-muted-foreground"}`}>
                  {c.name}
                </div>
              </button>
            );
          })}
        </div>


        {/* Filter / Sort */}
        <div className="mt-4 flex items-center justify-between px-4 pb-3">
          <motion.button
            whileTap="tap" variants={buttonTap}
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 border border-border rounded-[3px] px-4 py-2 text-[12px] font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </motion.button>
          <motion.button whileTap="tap" variants={buttonTap} onClick={() => setSortOpen(true)} className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-semibold">{activeSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2 px-4">
          {displayed.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} saleMode />
            </motion.div>
          ))}
        </motion.div>

        {filteredProducts.length > 0 && (
          <div className="px-4 mt-5">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
          </div>
        )}

        {/* Filter Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} className="fixed inset-0 z-40 bg-black/50" />
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-x-0 bottom-0 h-[92vh] z-50 bg-background flex flex-col rounded-t-[28px] overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.25)]"
              >
                <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5 border-b border-border">
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setFilterOpen(false)} aria-label="Close"><X className="h-5 w-5" /></motion.button>
                  <h2 className="text-center text-sm font-display font-bold tracking-widest uppercase">Filters</h2>
                  <button onClick={() => setFilters(defaultFilters)} className="text-[12px] text-muted-foreground hover:text-foreground">Reset</button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-2">
                  <ProductFilters filters={filters} onChange={setFilters} showReset={false} />
                </div>
                <div className="p-3 border-t border-border">
                  <button onClick={() => setFilterOpen(false)} className="w-full py-3.5 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]">
                    Apply Filters
                  </button>
                  <div className="text-center text-[11px] text-muted-foreground mt-2">{filteredProducts.length} items</div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sort Drawer */}
        <AnimatePresence>
          {sortOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSortOpen(false)} className="fixed inset-0 z-40 bg-black/50" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-xl">
                <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-display font-bold tracking-widest uppercase">Sort By</h2>
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setSortOpen(false)}><X className="h-5 w-5" /></motion.button>
                </div>
                <div className="py-2 pb-6">
                  {[{ id: "featured", label: "Featured" }, ...sortOptions].map((s) => (
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
