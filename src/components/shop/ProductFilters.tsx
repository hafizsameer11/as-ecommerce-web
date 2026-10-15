import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown } from "lucide-react";
import { categories, subCategories, sizes, colorOptions, priceRanges, availabilityOptions, brands } from "@/lib/shop-data";

export type FilterState = {
  categories: string[];
  subCategories: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  priceRanges: string[];
  availability: string[];
  minPrice: string;
  maxPrice: string;
};


export const defaultFilters: FilterState = {
  categories: [],
  subCategories: [],
  sizes: [],
  colors: [],
  brands: [],
  priceRanges: [],
  availability: [],
  minPrice: "",
  maxPrice: "",
};


type SectionProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
      <div
        className={`h-4 w-4 rounded-[3px] border flex items-center justify-center transition-colors ${
          checked ? "bg-ink border-ink" : "border-border bg-background group-hover:border-ink/40"
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span className="text-[13px] text-foreground/80">{label}</span>
    </label>
  );
}

export function ProductFilters({
  filters,
  onChange,
  activeCategory,
  showReset = true,
}: {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  activeCategory?: string;
  showReset?: boolean;
}) {
  const toggle = (key: keyof FilterState, value: string) => {
    const arr = filters[key] as string[];
    onChange({ ...filters, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  const activeCount =
    filters.categories.length +
    filters.subCategories.length +
    filters.sizes.length +
    filters.colors.length +
    filters.brands.length +
    filters.priceRanges.length +

    filters.availability.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0);

  return (
    <div className="space-y-0">
      <div className="flex items-center justify-between pb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest">Filters</h3>
        {showReset && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Clear All {activeCount > 0 && `(${activeCount})`}
          </button>
        )}
      </div>

      <FilterSection title="Category">
        <div className="space-y-1">
          {activeCategory && subCategories[activeCategory] ? (
            <>
              {subCategories[activeCategory]
                .filter((sub) => !sub.toLowerCase().startsWith("all"))
                .slice(0, 8)
                .map((sub) => (
                  <Checkbox
                    key={sub}
                    label={sub}
                    checked={filters.subCategories.includes(sub)}
                    onChange={() => toggle("subCategories", sub)}
                  />
                ))}
              {subCategories[activeCategory].filter((sub) => !sub.toLowerCase().startsWith("all")).length > 8 && (
                <div className="mt-2 text-[11px] text-muted-foreground underline cursor-pointer">+ View More</div>
              )}
            </>
          ) : (
            categories.map((c) => (
              <Checkbox
                key={c.id}
                label={c.name}
                checked={filters.categories.includes(c.id)}
                onChange={() => toggle("categories", c.id)}
              />
            ))
          )}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggle("sizes", s)}
              className={`py-2 text-[12px] font-medium border rounded-[3px] transition-colors ${
                filters.sizes.includes(s)
                  ? "bg-ink text-white border-ink"
                  : "border-border bg-background hover:border-ink/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground underline cursor-pointer">Size Guide</div>
      </FilterSection>

      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <button
              key={c.name}
              onClick={() => toggle("colors", c.name)}
              className={`relative h-7 w-7 rounded-full border border-border flex items-center justify-center transition-all ${
                filters.colors.includes(c.name) ? "ring-1 ring-offset-1 ring-ink scale-110" : "hover:scale-105"
              }`}
              style={{ background: c.hex === "linear" ? "conic-gradient(from 180deg, #000 0deg, #fff 90deg, #c44569 180deg, #2d5a3d 270deg, #000 360deg)" : c.hex }}
              title={c.name}
            />
          ))}
        </div>
        <div className="mt-2 text-[11px] text-muted-foreground underline cursor-pointer">+ View More</div>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
          {brands.map((b) => (
            <Checkbox
              key={b}
              label={b}
              checked={filters.brands.includes(b)}
              onChange={() => toggle("brands", b)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price">

        <div className="space-y-1">
          {priceRanges.map((r) => (
            <Checkbox
              key={r.id}
              label={r.label}
              checked={filters.priceRanges.includes(r.id)}
              onChange={() => toggle("priceRanges", r.id)}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="MIN"
            value={filters.minPrice}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
            className="w-full px-3 py-2 text-[12px] border border-border rounded-[3px] bg-background outline-none focus:border-ink"
          />
          <input
            type="number"
            placeholder="MAX"
            value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
            className="w-full px-3 py-2 text-[12px] border border-border rounded-[3px] bg-background outline-none focus:border-ink"
          />
        </div>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-1">
          {availabilityOptions.map((a) => (
            <Checkbox
              key={a}
              label={a}
              checked={filters.availability.includes(a)}
              onChange={() => toggle("availability", a)}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}
