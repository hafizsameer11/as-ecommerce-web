import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { BadgeCheck, Truck, Shield, RefreshCcw } from "lucide-react";
import { ProductFilters, defaultFilters, type FilterState } from "./ProductFilters";
import { DesktopFilterButton } from "./DesktopFilterBar";
import { ProductCard } from "./ProductCard";
import Pagination from "./Pagination";
import { sortOptions, type Product } from "@/lib/shop-data";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

const PER_PAGE = 12;

export type CollectionMeta = {
  title: string;
  eyebrow: string;
  tagline: string;
  heroImage: string;
  conciergeMode?: boolean;
};

function useFiltered(all: Product[], filters: FilterState, sort: string) {
  return useMemo(() => {
    let result = [...all];

    if (filters.subCategories.length > 0) {
      result = result.filter((p) => p.subcategory && filters.subCategories.includes(p.subcategory));
    }
    if (filters.sizes.length > 0) {
      result = result.filter((p) => p.sizes.some((s) => filters.sizes.includes(s)));
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c.name)));
    }
    if (filters.priceRanges.length > 0) {
      result = result.filter((p) =>
        filters.priceRanges.some((r) => {
          if (r === "under-100k") return p.price < 100000;
          if (r === "100k-250k") return p.price >= 100000 && p.price <= 250000;
          if (r === "250k-500k") return p.price >= 250000 && p.price <= 500000;
          if (r === "above-500k") return p.price >= 500000;
          return true;
        }),
      );
    }
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? Number(filters.minPrice) : 0;
      const max = filters.maxPrice ? Number(filters.maxPrice) : Infinity;
      result = result.filter((p) => p.price >= min && p.price <= max);
    }
    if (filters.brands.length > 0) result = result.filter((p) => filters.brands.includes(p.brand));
    if (filters.availability.length > 0) {
      result = result.filter((p) => filters.availability.includes(p.availability));
    }

    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    else if (sort === "name-az") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [all, filters, sort]);
}

export function MobileCollection({ meta, products }: { meta: CollectionMeta; products: Product[] }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.body.style.overflow = filterOpen || sortOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen, sortOpen]);

  const filtered = useFiltered(products, filters, sort);
  useEffect(() => setPage(1), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const displayed = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const activeSortLabel = sort === "popular" ? "Popular" : sortOptions.find((s) => s.id === sort)?.label ?? "Popular";

  return (
    <MobileShell activeBottom="shop" headerVariant="shop" showTopTabs={false} onBack={() => window.history.back()}>
      <div className="min-h-screen bg-background pb-6">
        <nav className="flex items-center gap-1 text-[10px] text-muted-foreground px-4 pt-2 pb-1">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-ink font-medium">{meta.title}</span>
        </nav>

        {/* Hero banner */}
        <div className="relative mx-4 mt-1 h-[170px] rounded-xl overflow-hidden">
          <img src={meta.heroImage} alt={meta.title} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-4 max-w-[75%]">
            <div className="text-[9px] font-bold tracking-[0.24em] uppercase text-primary mb-1.5">{meta.eyebrow}</div>
            <h1 className="font-display font-bold text-white text-2xl tracking-widest uppercase leading-none">{meta.title}</h1>
            <p className="mt-2 text-white/90 text-[10px] leading-snug">{meta.tagline}</p>
          </div>
        </div>

        {/* Filter / Sort row */}
        <div className="mt-4 flex items-center justify-between px-4 pb-3">
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 border border-border rounded-[3px] px-4 py-2 text-[12px] font-semibold"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filter
          </motion.button>
          <motion.button whileTap="tap" variants={buttonTap} onClick={() => setSortOpen(true)} className="flex items-center gap-2 text-[12px]">
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-semibold">{activeSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.button>
        </div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-2 px-4">
          {displayed.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} eyebrow={meta.eyebrow} conciergeMode={meta.conciergeMode} />
            </motion.div>
          ))}
        </motion.div>

        {displayed.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm px-4">No products match your filters.</div>
        )}

        {filtered.length > 0 && (
          <div className="px-4 mt-6">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">Page {currentPage} of {totalPages}</p>
          </div>
        )}

        {/* Filter Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)} className="fixed inset-0 z-40 bg-black/50" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-x-0 bottom-0 h-[92vh] z-50 bg-background flex flex-col rounded-t-[28px] overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.25)]">
                <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5 border-b border-border">
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setFilterOpen(false)} aria-label="Close">
                    <X className="h-5 w-5" />
                  </motion.button>
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
                  <div className="text-center text-[11px] text-muted-foreground mt-2">{filtered.length} items</div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sort Drawer */}
        <AnimatePresence>
          {sortOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSortOpen(false)} className="fixed inset-0 z-40 bg-black/50" />
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }} className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-xl">
                <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-display font-bold tracking-widest uppercase">Sort By</h2>
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setSortOpen(false)}>
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="py-2 pb-6">
                  {[{ id: "popular", label: "Popular" }, ...sortOptions].map((s) => (
                    <button key={s.id}
                      onClick={() => { setSort(s.id); setSortOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-3 text-left text-[13px] hover:bg-muted">
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

export function DesktopCollection({ meta, products }: { meta: CollectionMeta; products: Product[] }) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useFiltered(products, filters, sort);
  useEffect(() => setPage(1), [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * PER_PAGE, filtered.length);
  const displayed = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const activeSortLabel = sort === "popular" ? "Popular" : sortOptions.find((s) => s.id === sort)?.label ?? "Popular";

  return (
    <DesktopShell active="Shop">
      <div className="mx-auto max-w-[1600px] px-6 pt-4">
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">{meta.title}</span>
        </nav>

        <div className="relative w-full h-[320px] rounded-xl overflow-hidden mb-6">
          <img src={meta.heroImage} alt={meta.title} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent" />
          <div className="relative h-full flex flex-col justify-center px-10 max-w-2xl">
            <div className="text-[11px] font-bold tracking-[0.24em] uppercase text-primary mb-2">{meta.eyebrow}</div>
            <h1 className="font-display font-bold text-white text-5xl tracking-widest uppercase">{meta.title}</h1>
            <p className="mt-3 text-white/90 text-[13px] leading-relaxed max-w-md">{meta.tagline}</p>
          </div>
        </div>

        <div className="pb-6">
          <div className="min-w-0">
            <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-center justify-between mb-2">
              <h2 className="text-[13px] text-muted-foreground">
                Showing <span className="text-ink font-semibold">{rangeStart} - {rangeEnd}</span> of {filtered.length} products
              </h2>
              <div className="flex items-center gap-2">
              <DesktopFilterButton filters={filters} onChange={setFilters} resultCount={filtered.length} />
              <div className="relative">
                <button onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-[12px] border border-border px-3 py-2 rounded-[3px] hover:border-ink/40">
                  Sort by: {activeSortLabel}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-background border border-border rounded-[3px] shadow-lg z-20 py-1">
                    {[{ id: "popular", label: "Popular" }, ...sortOptions].map((s) => (
                      <button key={s.id}
                        onClick={() => { setSort(s.id); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-[12px] hover:bg-muted ${sort === s.id ? "font-semibold" : ""}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-3">
              {displayed.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} eyebrow={meta.eyebrow} conciergeMode={meta.conciergeMode} />
                </motion.div>
              ))}
            </motion.div>

            {displayed.length === 0 && (
              <div className="py-20 text-center text-muted-foreground text-sm">No products match your filters.</div>
            )}

            {filtered.length > 0 && (
              <div className="mt-8">
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
