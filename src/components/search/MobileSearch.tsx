import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, getRouteApi, Link } from "@tanstack/react-router";
import { Search, X, Mic, Wand2, Clock, TrendingUp, ArrowUpRight, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { ProductFilters, defaultFilters, type FilterState } from "@/components/shop/ProductFilters";
import { staggerContainer, staggerItem, buttonTap, imageZoom } from "@/lib/motion";
import { popularSearches as fallbackPopular } from "@/lib/search-data";
import { trendingProducts as trendingShopProducts } from "@/lib/shop-data";

import { usePopularSearches, useSearchProducts } from "@/lib/search";
import { useRecentSearches } from "@/lib/recent-searches";


const routeApi = getRouteApi("/search");

const voicePhrases = [
  "White sneakers",
  "Black hoodie",
  "Luxury watch",
  "Men's fragrance",
  "Amiri slides",
  "Designer sunglasses",
];

export function MobileSearch() {
  const { q } = routeApi.useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { recents, add, clear, removeOne } = useRecentSearches();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const popularSearches = usePopularSearches();
  const popular = popularSearches.length ? popularSearches : fallbackPopular;
  const { results: rawResults } = useSearchProducts(q);
  const results = rawResults.filter((p) => {
    if (filters.categories.length && !filters.categories.includes(p.category)) return false;
    if (filters.brands.length && !filters.brands.includes(p.brand)) return false;
    if (filters.subCategories.length && (!p.subcategory || !filters.subCategories.includes(p.subcategory))) return false;
    if (filters.priceRanges.length) {
      const hit = filters.priceRanges.some((r) =>
        (r === "under-100k" && p.price < 100000) ||
        (r === "100k-250k" && p.price >= 100000 && p.price <= 250000) ||
        (r === "250k-500k" && p.price >= 250000 && p.price <= 500000) ||
        (r === "above-500k" && p.price >= 500000)
      );
      if (!hit) return false;
    }
    return true;
  });

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, []);

  const setQuery = (next: string) =>
    navigate({ to: "/search", search: { q: next }, replace: true });

  const submit = (val: string) => {
    if (!val.trim()) return;
    add(val.trim());
    navigate({ to: "/search", search: { q: val.trim() } });
  };

  const startVoice = () => {
    toast("Listening…");
    const phrase = voicePhrases[Math.floor(Math.random() * voicePhrases.length)];
    setTimeout(() => submit(phrase), 1400);
  };

  return (
    <MobileShell activeBottom="search" showTopTabs={false} headerVariant="shop">
      <div className="sticky top-[54px] z-20 bg-background border-b border-border">
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-3.5 py-2.5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(q)}
              placeholder="Search brands, styles, products…"
              className="flex-1 bg-transparent outline-none text-[16px] placeholder:text-muted-foreground min-w-0"

            />
            {q && (
              <button onClick={() => setQuery("")} aria-label="Clear">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <motion.button
              whileTap="tap"
              variants={buttonTap}
              onClick={startVoice}
              aria-label="Voice search"
              className="shrink-0 grid place-items-center h-7 w-7 rounded-full text-foreground"
            >
              <Mic className="h-4 w-4" strokeWidth={2} />
            </motion.button>
          </div>
          <button
            onClick={() => navigate({ to: "/" })}
            className="text-[12px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      </div>

      {q ? (
        <ResultsMobile query={q} results={results} onOpenFilter={() => setFilterOpen(true)} />
      ) : (
        <EmptyMobile
          onSelect={(s) => { setQuery(s); submit(s); }}
          recents={recents}
          clear={clear}
          removeOne={removeOne}
          popular={popular}
        />
      )}

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
                <button onClick={() => setFilterOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
                <h2 className="text-center text-sm font-display font-bold tracking-widest uppercase">Filters</h2>
                <button onClick={() => setFilters(defaultFilters)} className="text-[12px] text-muted-foreground">Reset</button>
              </div>
              <div className="flex-1 overflow-y-auto px-3 py-2">
                <ProductFilters filters={filters} onChange={setFilters} showReset={false} />
              </div>
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-3.5 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]"
                >
                  Show {results.length} results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobileShell>
  );
}


function ResultsMobile({ query, results, onOpenFilter }: { query: string; results: import("@/lib/shop-data").Product[]; onOpenFilter: () => void }) {
  return (
    <section className="px-3 pt-4 pb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[12px] text-muted-foreground">
          <span className="font-semibold text-ink">{results.length}</span> results for "<span className="font-semibold text-ink">{query}</span>"
        </div>
        <button onClick={onOpenFilter} className="inline-flex items-center gap-1 text-[11px] font-semibold text-ink">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
        </button>
      </div>
      {results.length === 0 ? (
        <div className="rounded-md border border-border bg-white p-6 text-center text-[13px] text-muted-foreground">
          No products match "{query}". Try a different keyword.
          <div className="mt-3">
            <Link to="/shop" className="inline-flex h-9 px-4 items-center rounded bg-ink text-white text-[12px] font-semibold">Browse Shop</Link>
          </div>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          {results.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}


function EmptyMobile({
  onSelect, recents, clear, removeOne, popular,
}: {
  onSelect: (s: string) => void;
  recents: string[];
  clear: () => void;
  removeOne: (s: string) => void;
  popular: string[];
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-3 mt-3 rounded-xl overflow-hidden bg-ink text-paper p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Wand2 className="h-4 w-4 text-gold" />
          <div className="text-[11px] font-semibold tracking-[0.25em] uppercase text-gold">Find Your Next Piece</div>
        </div>
        <div className="text-[13px] text-paper/85 leading-snug">
          Search thousands of authentic luxury products from the world's leading designer brands.
        </div>
      </motion.div>


      {recents.length > 0 && (
        <section className="px-3 pt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <h2 className="text-[11px] font-display font-bold tracking-[0.25em] uppercase">Recent</h2>
            </div>
            <button onClick={clear} className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {recents.map((r) => (
              <li key={r} className="flex items-center gap-3 py-3">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                <button onClick={() => onSelect(r)} className="flex-1 text-left text-[13px]">{r}</button>
                <button onClick={() => removeOne(r)} aria-label="Remove"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-3 pt-6">
        <h2 className="text-[11px] font-display font-bold tracking-[0.25em] uppercase mb-3">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {popular.map((p) => (
            <button key={p} onClick={() => onSelect(p)} className="rounded-full border border-border bg-background px-3.5 py-2 text-[12px] font-medium">
              {p}
            </button>
          ))}
        </div>
      </section>

      <section className="px-3 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-3.5 w-3.5 text-gold" />
          <h2 className="text-[11px] font-display font-bold tracking-[0.25em] uppercase">Trending Now</h2>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3">
          {trendingShopProducts.map((p) => (
            <motion.div key={p.id} variants={staggerItem}>
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>


      </section>
    </>
  );
}
