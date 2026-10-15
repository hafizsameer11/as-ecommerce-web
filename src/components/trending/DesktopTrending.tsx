import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { ProductFilters, defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const PER_PAGE = 12;
import { sortOptions } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

export function DesktopTrending() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { products: displayed, meta } = useStoreProducts({
    preset: "trending",
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

  const activeFilterCount =
    filters.categories.length +
    filters.subCategories.length +
    filters.sizes.length +
    filters.colors.length +
    filters.brands.length +
    filters.priceRanges.length +
    filters.availability.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0);

  return (
    <DesktopShell active="New In">
      <div className="mx-auto max-w-[1600px] px-6 pt-4 pb-6">
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="hover:text-ink cursor-pointer">New & Trending</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">Trending Now</span>
        </nav>

        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-end justify-between mb-4">
          <div>
            <h1 className="font-display font-bold text-3xl tracking-widest uppercase text-ink">Trending Now</h1>
            <p className="text-[13px] text-muted-foreground mt-1">See what's hot right now. The styles everyone's loving.</p>
          </div>
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 text-[12px] border-border hover:border-ink/40 rounded-[3px]">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] sm:w-[340px] p-0">
                <SheetHeader className="px-5 py-4 border-b border-border text-left">
                  <SheetTitle className="text-xs font-bold uppercase tracking-widest">Filters</SheetTitle>
                </SheetHeader>
                <div className="px-5 py-4 overflow-y-auto h-[calc(100vh-8rem)]">
                  <ProductFilters filters={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 text-[12px] border border-border px-3 py-2 rounded-[3px] hover:border-ink/40 h-9"
              >
                <span className="text-muted-foreground">Sort by:</span>
                <span className="font-semibold">{activeSortLabel}</span>
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

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-3 gap-y-6"
        >
          {displayed.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} trendingBadge />
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
