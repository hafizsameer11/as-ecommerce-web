import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Search, X, Mic, Wand2, Clock, TrendingUp, ArrowUpRight, Trash2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { ProductCard } from "@/components/shop/ProductCard";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { popularSearches as fallbackPopular, aiSuggestions } from "@/lib/search-data";
import { trendingProducts as trendingShopProducts } from "@/lib/shop-data";
import { usePopularSearches, useSearchProducts } from "@/lib/search";
import { useRecentSearches } from "@/lib/recent-searches";

const routeApi = getRouteApi("/search");

export function DesktopSearch() {
  const { q } = routeApi.useSearch();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { recents, add, clear, removeOne } = useRecentSearches();
  const apiPopular = usePopularSearches();
  const popularSearches = apiPopular.length ? apiPopular : fallbackPopular;
  const { results } = useSearchProducts(q);

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

  return (
    <DesktopShell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 border-b-2 border-ink pb-4">
            <Search className="h-6 w-6 text-ink shrink-0" strokeWidth={1.8} />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit(q)}
              placeholder="What are you looking for?"
              className="flex-1 bg-transparent outline-none text-xl md:text-2xl font-display placeholder:text-muted-foreground min-w-0"
            />
            {q && (
              <button onClick={() => setQuery("")} aria-label="Clear">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={() => {
                toast("Listening…");
                const phrases = ["White sneakers", "Black hoodie", "Luxury watch", "Men's fragrance", "Amiri slides"];
                const phrase = phrases[Math.floor(Math.random() * phrases.length)];
                setTimeout(() => submit(phrase), 1400);
              }}
              aria-label="Voice search"
              className="grid place-items-center h-11 w-11 rounded-full border border-border text-foreground hover:bg-muted"
            >
              <Mic className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </motion.div>

        {q ? (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">
                {results.length} results for "<span className="text-gold">{q}</span>"
              </h2>
              <button className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </button>
            </div>
            {results.length === 0 ? (
              <div className="rounded-lg border border-border bg-white p-6 text-center text-sm text-muted-foreground">
                No products match "{q}". Try a different keyword.
                <div className="mt-4">
                  <Link to="/shop" className="inline-flex h-10 px-5 items-center rounded bg-ink text-white text-[13px] font-semibold">Browse Shop</Link>
                </div>
              </div>
            ) : (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        ) : (
          <div className="mt-12 space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              <div className="space-y-10">
                {recents.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <h2 className="text-xs font-display font-bold tracking-[0.25em] uppercase">Recent</h2>
                      </div>
                      <button onClick={clear} className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                        <Trash2 className="h-3 w-3" /> Clear
                      </button>
                    </div>
                    <ul className="divide-y divide-border border-y border-border">
                      {recents.map((r) => (
                        <li key={r} className="flex items-center gap-3 py-3">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                          <button onClick={() => submit(r)} className="flex-1 text-left text-sm">{r}</button>
                          <button onClick={() => removeOne(r)} aria-label="Remove"><X className="h-3.5 w-3.5 text-muted-foreground" /></button>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section>
                  <h2 className="text-xs font-display font-bold tracking-[0.25em] uppercase mb-4">Popular Searches</h2>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((p) => (
                      <button key={p} onClick={() => submit(p)} className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium hover:bg-muted">
                        {p}
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              <div className="rounded-2xl overflow-hidden bg-ink text-paper p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="h-4 w-4 text-gold" />
                  <div className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold">Find Your Next Piece</div>
                </div>
                <div className="text-sm text-paper/70 leading-relaxed mb-5">
                  Search thousands of authentic luxury products from the world's leading designer brands.
                </div>
                <div className="text-[10px] font-semibold tracking-[0.3em] uppercase text-paper/50 mb-3">Suggestions</div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((s) => (
                    <button key={s} onClick={() => submit(s)} className="rounded-full border border-paper/25 px-4 py-2 text-[12px] text-paper/90 hover:bg-paper/10">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-4 w-4 text-gold" />
                <h2 className="text-xs font-display font-bold tracking-[0.25em] uppercase">Trending Now</h2>
              </div>
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingShopProducts.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </motion.div>
            </section>
          </div>

        )}
      </div>
    </DesktopShell>
  );
}
