import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, ChevronUp, ChevronDown, ChevronLeft, Search, Star, Shirt, Footprints, ShoppingBag, SprayCan, Tag } from "lucide-react";
import { MobileShell } from "@/components/shell/MobileShell";
import { subCategories } from "@/lib/shop-data";

type Cat = {
  id: string;
  name: string;
  Icon?: any;
  badge?: "concierge";
  sub?: string;
  to?: string;
  hasItems?: boolean;
};

const categories: Cat[] = [
  { id: "new", name: "NEW & TRENDING", Icon: Star, sub: "New Arrivals, Best Sellers", to: "/trending" },
  { id: "clothing", name: "CLOTHING", Icon: Shirt, hasItems: true },
  { id: "footwear", name: "FOOTWEAR", Icon: Footprints, hasItems: true },
  { id: "accessories", name: "ACCESSORIES", Icon: ShoppingBag, hasItems: true },
  { id: "fragrances", name: "FRAGRANCES", Icon: SprayCan, hasItems: true },
  { id: "sales", name: "SALES", Icon: Tag, to: "/shop/sales" },
  { id: "concierge", name: "FASHION CONCIERGE", badge: "concierge", to: "/concierge-service" },
];

export function MobileCategoryBrowse({ initialOpen = ["clothing", "footwear"] }: { initialOpen?: string[] }) {
  const [open, setOpen] = useState<string[]>(initialOpen);
  const navigate = useNavigate();

  const key = initialOpen.join(",");
  useEffect(() => {
    setOpen((prev) => Array.from(new Set([...prev, ...initialOpen])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <MobileShell activeTop="shop" activeBottom="shop">
      <div className="bg-background border-b border-border">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-4 py-3">
          <button onClick={() => navigate({ to: "/shop" })} aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center font-display font-bold text-sm tracking-[0.25em]">SHOP</div>
          <button onClick={() => navigate({ to: "/search" })} aria-label="Search">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="divide-y divide-border">
        {categories.map((c) => {
          const isOpen = open.includes(c.id);
          const subs = c.hasItems ? (subCategories[c.id] ?? []).filter((s) => !s.toLowerCase().startsWith("all")) : [];

          const header = (
            <div className="w-full flex items-center gap-4 px-4 py-4 hover:bg-muted text-left">
              <div className="h-6 w-6 shrink-0 grid place-items-center">
                {c.badge === "concierge" ? (
                  <div className="text-center leading-none">
                    <div className="font-display font-bold text-[9px] tracking-[0.1em]">ASL</div>
                  </div>
                ) : c.Icon ? (
                  <c.Icon className="h-5 w-5" strokeWidth={1.7} />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-display font-bold tracking-[0.15em] uppercase">{c.name}</div>
                {c.sub && <div className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</div>}
              </div>
              {c.hasItems ? (
                isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
            </div>
          );

          return (
            <div key={c.id}>
              {c.hasItems ? (
                <button onClick={() => toggle(c.id)} className="w-full block">{header}</button>
              ) : (
                <Link to={c.to ?? "/shop"} className="block">{header}</Link>
              )}
              {c.hasItems && isOpen && (
                <div className="pb-2">
                  <Link
                    to="/shop/$category"
                    params={{ category: c.id }}
                    className="w-full block text-left px-14 py-2.5 text-[13px] font-semibold text-ink hover:bg-muted"
                  >
                    All {c.name.toLowerCase()}
                  </Link>
                  {subs.map((sub) => (
                    <Link
                      key={sub}
                      to="/shop/$category"
                      params={{ category: c.id }}
                      search={{ sub }}
                      className="w-full block text-left px-14 py-2.5 text-[13px] text-foreground/80 hover:bg-muted"
                    >
                      {sub}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-4 py-6 text-center">
        <Link to="/shop" className="text-[11px] tracking-widest text-muted-foreground uppercase">
          ← Back to Shop
        </Link>
      </div>
    </MobileShell>
  );
}
