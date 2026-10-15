import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductFilters, defaultFilters, type FilterState } from "./ProductFilters";

export function countActiveFilters(f: FilterState) {
  return (
    f.categories.length +
    f.subCategories.length +
    f.sizes.length +
    f.colors.length +
    f.brands.length +
    f.priceRanges.length +
    f.availability.length +
    (f.minPrice || f.maxPrice ? 1 : 0)
  );
}

export function DesktopFilterButton({
  filters,
  onChange,
  activeCategory,
  resultCount,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  activeCategory?: string;
  resultCount: number;
}) {
  const [open, setOpen] = useState(false);
  const active = countActiveFilters(filters);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-[12px] border border-border px-3 py-2 rounded-[3px] hover:border-ink/40"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters
        {active > 0 && (
          <span className="grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[9px] font-bold text-white">
            {active}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.28 }}
              className="fixed inset-y-0 right-0 z-50 w-[380px] max-w-[92vw] bg-background flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h2 className="text-sm font-bold tracking-widest uppercase">Filters</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onChange(defaultFilters)}
                    className="text-[12px] text-muted-foreground hover:text-foreground"
                  >
                    Reset
                  </button>
                  <button onClick={() => setOpen(false)} aria-label="Close filters">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <ProductFilters
                  filters={filters}
                  onChange={onChange}
                  activeCategory={activeCategory}
                  showReset={false}
                />
              </div>
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => setOpen(false)}
                  className="w-full py-3 bg-ink text-white text-[12px] font-bold uppercase tracking-widest rounded-[3px]"
                >
                  Show {resultCount} products
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
