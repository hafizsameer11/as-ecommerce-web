import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X, ChevronDown, Check } from "lucide-react";
import { buttonTap } from "@/lib/motion";
import { categories, type Product } from "@/lib/shop-data";

export type BrandEntry = { name: string; count: number; sample: Product; categories: string[] };

export function buildBrandEntries(products: Product[]): BrandEntry[] {
  const grouped = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.brand.trim().toUpperCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }
  return [...grouped.entries()]
    .map(([name, items]) => ({
      name,
      count: items.length,
      sample: items[0]!,
      categories: [...new Set(items.map((i) => i.category))],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function useAllBrandEntries() {
  const [brands, setBrands] = useState<BrandEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/api/catalog")
      .then(({ catalogApi }) => catalogApi.brands())
      .then((rows) => {
        if (cancelled || !rows?.length) return;
        setBrands(
          rows
            .map((b) => {
              const sample = {
                id: b.handle,
                brand: b.name,
                brandHandle: b.handle,
                name: b.name,
                price: 0,
                image: b.image || "/favicon.png",
                category: "clothing",
                sizes: ["One Size"],
                colors: [{ name: "Default", hex: "#0a0a0a" }],
                availability: "In Stock" as const,
              } satisfies Product;
              return {
                name: b.name.toUpperCase(),
                count: b.itemCount ?? 0,
                sample,
                categories: [] as string[],
              };
            })
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return brands;
}

const sortOptions = [
  { id: "az", label: "A - Z" },
  { id: "za", label: "Z - A" },
  { id: "most", label: "Most pieces" },
  { id: "least", label: "Fewest pieces" },
] as const;
type SortId = (typeof sortOptions)[number]["id"];

const letterGroups = ["A - F", "G - L", "M - R", "S - Z", "0 - 9"] as const;

const inLetterGroup = (name: string, group: string) => {
  const c = name[0]!.toUpperCase();
  if (group === "0 - 9") return !/[A-Z]/.test(c);
  const [from, to] = group.split(" - ") as [string, string];
  return c >= from && c <= to;
};

export function BrandDirectory({
  brands,
  eyebrow,
  title,
  subtitleUnit = "products in stock",
  cardTag,
  isDesktop,
  breadcrumb,
}: {
  brands: BrandEntry[];
  eyebrow: string;
  title: string;
  subtitleUnit?: string;
  cardTag?: string;
  isDesktop: boolean;
  breadcrumb?: React.ReactNode;
}) {
  const [q, setQ] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sort, setSort] = useState<SortId>("az");
  const [cats, setCats] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>([]);

  const toggle = (list: string[], set: (v: string[]) => void, value: string) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const activeCount = cats.length + letters.length;

  const filtered = useMemo(() => {
    let out = brands.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase()));
    if (cats.length) out = out.filter((b) => b.categories.some((c) => cats.includes(c)));
    if (letters.length) out = out.filter((b) => letters.some((g) => inLetterGroup(b.name, g)));
    const sorted = [...out];
    if (sort === "az") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") sorted.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "most") sorted.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    if (sort === "least") sorted.sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));
    return sorted;
  }, [brands, q, cats, letters, sort]);

  const grouped = useMemo(() => {
    if (sort === "most" || sort === "least") return [["", filtered]] as [string, BrandEntry[]][];
    const map = new Map<string, BrandEntry[]>();
    for (const b of filtered) {
      const letter = /[A-Z]/.test(b.name[0]!.toUpperCase()) ? b.name[0]!.toUpperCase() : "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(b);
    }
    const entries = [...map.entries()];
    entries.sort(([a], [b]) => (sort === "za" ? b.localeCompare(a) : a.localeCompare(b)));
    return entries;
  }, [filtered, sort]);

  const activeSortLabel = sortOptions.find((s) => s.id === sort)!.label;

  return (
    <div className={`${isDesktop ? "mx-auto max-w-[1400px] px-6" : "px-4"} py-5`}>
      {breadcrumb}

      <div className="mb-4">
        <div className={`text-[11px] font-bold tracking-widest ${cardTag ? "text-primary" : "text-muted-foreground"}`}>{eyebrow}</div>
        <h1 className="font-display font-bold text-xl md:text-3xl text-ink">{title}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">
          {filtered.length} {filtered.length === 1 ? "brand" : "brands"} · {filtered.reduce((s, b) => s + b.count, 0)} {subtitleUnit}
        </p>
      </div>

      <div className="relative mb-3">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search brands"
          className="w-full h-11 pl-10 pr-4 border border-border rounded-[3px] bg-background text-[16px] md:text-[13px] focus:outline-none focus:border-ink"
        />
      </div>

      {/* Filter / Sort row */}
      <div className="flex items-center justify-between pb-4">
        <motion.button
          whileTap="tap"
          variants={buttonTap}
          onClick={() => setFilterOpen(true)}
          className="flex items-center gap-2 border border-border rounded-[3px] px-4 py-2 text-[12px] font-semibold"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filter
          {activeCount > 0 && (
            <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
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

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-[13px]">No brands match your filters.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([letter, items]) => (
            <section key={letter || "all"}>
              {letter && (
                <div className="text-[11px] font-bold tracking-widest text-ink border-b border-border pb-2 mb-3">{letter}</div>
              )}
              <div className={`grid ${isDesktop ? "grid-cols-4" : "grid-cols-2"} gap-3`}>
                {items.map((b) => (
                  <motion.div key={b.name} whileHover={{ y: -2 }}>
                    <Link
                      to="/brands/$brand"
                      params={{ brand: b.name.toLowerCase().replace(/\s+/g, "-") }}
                      className="block border border-border rounded-lg overflow-hidden bg-background hover:border-ink transition-colors"
                    >
                      <div className="aspect-[4/3] bg-[#f2f2f2] grid place-items-center p-4">
                        <img src={b.sample.image} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                      </div>
                      <div className="px-3 py-2.5">
                        {cardTag && (
                          <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-primary mb-0.5">{cardTag}</div>
                        )}
                        <div className="text-[12px] font-bold uppercase tracking-widest text-ink truncate">{b.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{b.count} {b.count === 1 ? "item" : "items"}</div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Filter sheet */}
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
              className="fixed inset-x-0 bottom-0 max-h-[72vh] z-50 bg-background flex flex-col rounded-t-lg overflow-hidden shadow-2xl"
            >
              <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-3.5 border-b border-border">
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => setFilterOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </motion.button>
                <h2 className="text-center text-sm font-display font-bold tracking-widest uppercase">Filters</h2>
                <button
                  onClick={() => { setCats([]); setLetters([]); }}
                  className="text-[12px] text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-ink mb-3">Category</div>
                  <div className="flex flex-wrap gap-2">
                    {categories.filter((c) => c.id !== "sale").map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggle(cats, setCats, c.id)}
                        className={`px-3.5 py-2 rounded-[3px] border text-[12px] ${cats.includes(c.id) ? "bg-ink text-white border-ink font-semibold" : "border-border text-ink"}`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-ink mb-3">Alphabet</div>
                  <div className="flex flex-wrap gap-2">
                    {letterGroups.map((g) => (
                      <button
                        key={g}
                        onClick={() => toggle(letters, setLetters, g)}
                        className={`px-3.5 py-2 rounded-[3px] border text-[12px] ${letters.includes(g) ? "bg-ink text-white border-ink font-semibold" : "border-border text-ink"}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => setFilterOpen(false)}
                  className="w-full py-3.5 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]"
                >
                  Apply Filters
                </button>
                <div className="text-center text-[11px] text-muted-foreground mt-2">{filtered.length} brands</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sort sheet */}
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
              className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-[28px] overflow-hidden pb-6"
            >
              <div className="px-4 py-3.5 border-b border-border text-center text-sm font-display font-bold tracking-widest uppercase">
                Sort by
              </div>
              {sortOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setSort(s.id); setSortOpen(false); }}
                  className="w-full flex items-center justify-between px-5 py-4 text-[13px] border-b border-border/60"
                >
                  <span className={sort === s.id ? "font-semibold text-ink" : "text-ink"}>{s.label}</span>
                  {sort === s.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
