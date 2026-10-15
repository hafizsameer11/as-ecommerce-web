import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown, ChevronRight, Sparkle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { ProductFilters, defaultFilters, type FilterState } from "./ProductFilters";
import { ProductCard } from "./ProductCard";
import Pagination from "./Pagination";

const PER_PAGE = 12;
import { getCategoryName, sortOptions, categories, subCategories, getSubcategoryThumbnail } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import catClothing from "@/assets/cat-clothing.jpg";
import catFootwear from "@/assets/cat-footwear.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catFragrances from "@/assets/cat-fragrances.jpg";
import { staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

const heroImageMap: Record<string, string> = {
  clothing: catClothing,
  footwear: catFootwear,
  accessories: catAccessories,
  fragrances: catFragrances,
  sale: catClothing,
};

const heroTaglineMap: Record<string, string> = {
  clothing: "Elevated essentials. Premium pieces built for comfort, style and confidence.",
  footwear: "Step up your style. Premium footwear for every occasion and every step.",
  accessories: "Finishing touches. Premium accessories to elevate every look.",
  fragrances: "Signature scents. Premium fragrances for every mood and moment.",
  sale: "Limited-time picks at standout prices.",
};


export function MobileCategory({ categoryId, initialSub }: { categoryId: string; initialSub?: string }) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    subCategories: initialSub ? [initialSub] : [],
  });
  const [sort, setSort] = useState("popular");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilters((f) => ({ ...f, subCategories: initialSub ? [initialSub] : [] }));
  }, [initialSub, categoryId]);

  useEffect(() => {
    document.body.style.overflow = filterOpen || sortOpen || categoryOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen, sortOpen, categoryOpen]);

  const { products: displayedProducts, meta } = useStoreProducts({
    category: categoryId,
    filters,
    sort,
    page,
    pageSize: PER_PAGE,
    onSale: categoryId === "sale" || categoryId === "sales",
  });

  useEffect(() => {
    setPage(1);
  }, [filters, sort, categoryId]);

  const totalPages = Math.max(1, meta.pageCount ?? 1);
  const currentPage = Math.min(page, totalPages);
  const filteredCount = meta.total ?? displayedProducts.length;

  const categoryName = getCategoryName(categoryId);
  const categoryCount = categories.find((c) => c.id === categoryId)?.itemCount ?? filteredCount;
  const activeSortLabel = sort === "popular" ? "Popular" : sortOptions.find((s) => s.id === sort)?.label ?? "Popular";
  const subs = subCategories[categoryId] ?? [];
  const heroImage = heroImageMap[categoryId] ?? catClothing;
  const heroTagline = heroTaglineMap[categoryId] ?? "Discover authentic pieces curated by ASL ORIGINALS.";

  return (
    <MobileShell
      activeBottom="shop"
      headerVariant="shop"
      showTopTabs={false}
      onBack={() => window.history.back()}
    >
      <div className="min-h-screen bg-background pb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[10px] text-muted-foreground px-4 pt-2 pb-1">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-2.5 w-2.5" />
          <span className="text-ink font-medium">{categoryName}</span>
        </nav>

        {/* Hero */}
        <div className="relative mx-4 mt-1 h-[170px] rounded-xl overflow-hidden">
          <img src={heroImage} alt={categoryName} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className={`absolute inset-0 ${categoryId === "accessories" || categoryId === "fragrances" ? "bg-gradient-to-r from-black/50 via-black/20 to-transparent" : "bg-gradient-to-r from-black/70 via-black/30 to-transparent"}`} />
          <div className="relative h-full flex flex-col justify-center px-4 max-w-[70%]">
            <h1 className="font-display font-bold text-white text-2xl tracking-widest uppercase leading-none flex items-center gap-2">
              {categoryName}
              {(categoryId === "accessories" || categoryId === "fragrances") && <Sparkle className="h-4 w-4 text-gold fill-gold" />}
            </h1>
            <p className="mt-2 text-white/90 text-[10px] leading-snug">{heroTagline}</p>
          </div>
        </div>

        {/* Subcategory tiles */}
        {subs.length > 0 && (
          <div className="mt-4 px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => setFilters({ ...filters, subCategories: [] })}
                className={`shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-widest ${filters.subCategories.length === 0 ? "bg-ink text-white border-ink" : "bg-background border-border"}`}
              >
                All
              </button>
              {subs
                .filter((s) => !s.toLowerCase().startsWith("all"))
                .map((sub) => {
                  const active = filters.subCategories.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() =>
                        setFilters({
                          ...filters,
                          subCategories: active
                            ? filters.subCategories.filter((s) => s !== sub)
                            : [sub],
                        })
                      }
                      className={`shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-widest ${active ? "bg-ink text-white border-ink" : "bg-background border-border"}`}
                    >
                      {sub}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

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
          <motion.button
            whileTap="tap"
            variants={buttonTap}
            onClick={() => setSortOpen(true)}
            className="flex items-center gap-2 text-[12px]"
          >
            <span className="text-muted-foreground">Sort:</span>
            <span className="font-semibold">{activeSortLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </motion.button>
        </div>


        {/* Product grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-2 px-4"
        >
          {displayedProducts.map((product) => (
            <motion.div key={product.id} variants={staggerItem}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        {displayedProducts.length === 0 && (
          <div className="py-16 text-center text-muted-foreground text-sm px-4">
            No products match your filters.
          </div>
        )}

        {filteredCount > 0 && (
          <div className="px-4 mt-6">
            <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        )}


        {/* Filter Drawer */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setFilterOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
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
                  <ProductFilters
                    filters={filters}
                    onChange={setFilters}
                    activeCategory={categoryId}
                    showReset={false}
                  />
                </div>
                <div className="p-3 border-t border-border">
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="w-full py-3.5 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]"
                  >
                    Apply Filters
                  </button>
                  <div className="text-center text-[11px] text-muted-foreground mt-2">
                    {filteredCount} items
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSortOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
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
                      onClick={() => {
                        setSort(s.id);
                        setSortOpen(false);
                       
                      }}
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

        {/* Category Drawer */}
        <AnimatePresence>
          {categoryOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setCategoryOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-xl"
              >
                <div className="px-3 py-3 border-b border-border flex items-center justify-between">
                  <h2 className="text-sm font-display font-bold tracking-widest uppercase">Category</h2>
                  <motion.button whileTap="tap" variants={buttonTap} onClick={() => setCategoryOpen(false)}>
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
                <div className="py-2 pb-6">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      to="/shop/$category"
                      params={{ category: c.id }}
                      onClick={() => setCategoryOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-3 text-left text-[13px] hover:bg-muted"
                    >
                      {c.name} ({c.itemCount})
                      {categoryId === c.id && <div className="h-2 w-2 rounded-full bg-ink" />}
                    </Link>
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
