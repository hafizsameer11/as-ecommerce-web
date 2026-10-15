import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Sparkle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { BadgeCheck, Truck, Shield, RefreshCcw } from "lucide-react";
import { defaultFilters, type FilterState } from "./ProductFilters";
import { DesktopFilterButton } from "./DesktopFilterBar";
import { ProductCard } from "./ProductCard";
import Pagination from "./Pagination";

const PER_PAGE = 12;
import { getCategoryName, sortOptions, categories, subCategories, getSubcategoryThumbnail } from "@/lib/shop-data";
import { useStoreProducts } from "@/lib/catalog-query";
import catClothing from "@/assets/cat-clothing.jpg";
import catFootwear from "@/assets/cat-footwear.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catFragrances from "@/assets/cat-fragrances.jpg";
import { fadeInUp, staggerContainer, staggerItem, buttonTap } from "@/lib/motion";

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
  sale: "Limited-time picks. Standout pieces at standout prices.",
};


export function DesktopCategory({ categoryId, initialSub }: { categoryId: string; initialSub?: string }) {
  const [filters, setFilters] = useState<FilterState>({
    ...defaultFilters,
    subCategories: initialSub ? [initialSub] : [],
  });
  const [sort, setSort] = useState("popular");
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setFilters((f) => ({ ...f, subCategories: initialSub ? [initialSub] : [] }));
  }, [initialSub, categoryId]);

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
  const rangeStart = filteredCount === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * PER_PAGE, filteredCount);

  const categoryName = getCategoryName(categoryId);
  const categoryCount = categories.find((c) => c.id === categoryId)?.itemCount ?? filteredCount;

  const activeSortLabel = sortOptions.find((s) => s.id === sort)?.label ?? "Popular";

  const subs = subCategories[categoryId] ?? [];
  const heroImage = heroImageMap[categoryId] ?? catClothing;
  const heroTagline = heroTaglineMap[categoryId] ?? "Discover authentic pieces curated by ASL ORIGINALS.";

  return (
    <DesktopShell active="Shop">
      <div className="mx-auto max-w-[1600px] px-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-3">
          <Link to="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/shop" className="hover:text-ink">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink font-medium">{categoryName}</span>
        </nav>

        {/* Hero */}
        <div className="relative w-full h-[320px] rounded-xl overflow-hidden mb-4">
          <img src={heroImage} alt={categoryName} className="absolute inset-0 w-full h-full object-cover object-center" />
          <div className={`absolute inset-0 ${categoryId === "accessories" || categoryId === "fragrances" ? "bg-gradient-to-r from-black/50 via-black/20 to-transparent" : "bg-gradient-to-r from-black/70 via-black/30 to-transparent"}`} />
          <div className="relative h-full flex flex-col justify-center px-10 max-w-2xl">
            <h1 className="font-display font-bold text-white text-5xl tracking-widest uppercase flex items-center gap-3">
              {categoryName}
              {(categoryId === "accessories" || categoryId === "fragrances") && <Sparkle className="h-5 w-5 text-gold fill-gold" />}
            </h1>
            <p className="mt-3 text-white/90 text-[13px] leading-relaxed max-w-md">{heroTagline}</p>
          </div>
        </div>

        {/* Subcategory tiles */}
        {subs.length > 0 && (
          <div className="mb-5 grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(subs.length, 8)}, minmax(0, 1fr))` }}>
            {subs.slice(0, 8).map((sub) => {
              const isAll = sub.toLowerCase().startsWith("all");
              const active = isAll ? filters.subCategories.length === 0 : filters.subCategories.includes(sub);
              const thumb = getSubcategoryThumbnail(categoryId, sub);
              return (
                <button
                  key={sub}
                  onClick={() => {
                    if (isAll) {
                      setFilters({ ...filters, subCategories: [] });
                    } else {
                      setFilters({
                        ...filters,
                        subCategories: filters.subCategories.includes(sub)
                          ? filters.subCategories.filter((s) => s !== sub)
                          : [...filters.subCategories, sub],
                      });
                    }
                  }}
                  className={`group flex flex-col items-center text-center ${active ? "opacity-100" : "opacity-95 hover:opacity-100"}`}
                >
                  <div className={`w-full aspect-square rounded-lg overflow-hidden bg-[#edebdf] flex items-center justify-center border ${active ? "border-ink" : "border-transparent"}`}>
                    {thumb && <img src={thumb} alt={sub} className="w-full h-full object-cover mix-blend-multiply" />}
                  </div>
                  <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-ink leading-tight">{sub}</div>
                </button>
              );
            })}
          </div>
        )}

        <div className="pb-6">
          {/* Main grid */}
          <div className="min-w-0">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="flex items-center justify-between mb-2"
            >
              <h2 className="text-[13px] text-muted-foreground">
                Showing <span className="text-ink font-semibold">{rangeStart} - {rangeEnd}</span> of {filteredCount} products
              </h2>

              <div className="flex items-center gap-2">
              <DesktopFilterButton
                filters={filters}
                onChange={setFilters}
                activeCategory={categoryId}
                resultCount={filteredCount}
              />
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
                        onClick={() => {
                          setSort(s.id);
                          setSortOpen(false);
                         
                        }}
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
              className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-x-3 gap-y-3"
            >
              {displayedProducts.map((product) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>

            {displayedProducts.length === 0 && (
              <div className="py-20 text-center text-muted-foreground text-sm">
                No products match your filters.
              </div>
            )}

            {filteredCount > 0 && (
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
