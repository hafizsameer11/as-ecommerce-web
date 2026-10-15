import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Toaster } from "sonner";
import { ArrowLeft, Heart } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { isOnSale, getProductSizeLabel, type Product } from "@/lib/shop-data";
import { useWishlist, type WishlistVariation } from "@/lib/wishlist";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProductsByIds } from "@/lib/catalog-product-cache";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";

import { fadeInUp } from "@/lib/motion";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist - ASL ORIGINALS" },
      { name: "description", content: "Items you've saved for later at ASL ORIGINALS." },
      { property: "og:title", content: "My Wishlist - ASL ORIGINALS" },
      { property: "og:description", content: "Items you've saved for later." },
    ],
  }),
  component: WishlistPage,
});

function useWishlistProducts(): { product: Product; variation?: WishlistVariation }[] {
  const ids = useWishlist((s) => s.ids);
  const variations = useWishlist((s) => s.variations);
  const idList = [...ids];
  const { products } = useProductsByIds(idList);
  const byId = new Map(products.map((p) => [p.id, p]));
  const out: { product: Product; variation?: WishlistVariation }[] = [];
  for (const id of ids) {
    const product = byId.get(id);
    if (product) out.push({ product, variation: variations[id] });
  }
  return out;
}

type WishFilter = "all" | "sale";

function FilterTabs({
  value,
  onChange,
  counts,
}: {
  value: WishFilter;
  onChange: (v: WishFilter) => void;
  counts: { all: number; sale: number };
}) {
  const tabs: { id: WishFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "sale", label: "On Sale", count: counts.sale },
  ];
  return (
    <div className="flex items-center gap-2">
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`px-4 h-9 rounded-full border text-[12px] font-semibold tracking-wide transition-colors ${
              active
                ? "bg-ink text-white border-ink"
                : "bg-transparent text-ink border-border hover:border-ink/40"
            }`}
          >
            {t.label} ({t.count})
          </button>
        );
      })}
    </div>
  );
}

function WishlistPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <Desktop /> : <Mobile />}
      <Toaster position="top-center" />
    </>
  );
}

function VariationLine({ product, variation }: { product: Product; variation?: WishlistVariation }) {
  if (!variation || (!variation.size && !variation.color)) return null;
  const parts: string[] = [];
  if (variation.size) parts.push(`Size: ${getProductSizeLabel(product, variation.size)}`);
  if (variation.color) parts.push(`Colour: ${variation.color}`);
  return <div className="mt-1 text-[10px] text-muted-foreground tracking-wide">{parts.join(" · ")}</div>;
}

function Card({ entry }: { entry: { product: Product; variation?: WishlistVariation } }) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <ProductCard product={entry.product} />
      <VariationLine product={entry.product} variation={entry.variation} />
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-border bg-white p-10 text-center">
      <Heart className="h-10 w-10 mx-auto mb-3 text-muted-foreground" strokeWidth={1.25} />
      <div className="font-display font-bold text-lg mb-1">Your wishlist is empty</div>
      <div className="text-sm text-muted-foreground mb-4">Tap the heart on any product to save it here.</div>
      <Link to="/shop" className="inline-flex h-10 px-5 items-center rounded bg-ink text-white text-[12px] font-semibold">Browse Shop</Link>
    </div>
  );
}

function Desktop() {
  const items = useWishlistProducts();
  const [filter, setFilter] = useState<WishFilter>("all");
  const saleItems = items.filter((e) => isOnSale(e.product));
  const shown = filter === "sale" ? saleItems : items;
  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="wishlist" />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold">My Wishlist</h1>
              <p className="text-sm text-muted-foreground mt-1">{items.length} items saved for later</p>
            </div>
            <Link to="/shop" className="text-[13px] font-semibold text-ink hover:text-gold">Continue Shopping →</Link>
          </div>
          <FilterTabs value={filter} onChange={setFilter} counts={{ all: items.length, sale: saleItems.length }} />
          {filter === "sale" && (
            <div>
              <h2 className="font-display font-bold text-lg">Sale</h2>
              <p className="text-sm text-muted-foreground">Items with promotions from all your wishlist.</p>
            </div>
          )}
          {items.length === 0 ? <EmptyState /> : shown.length === 0 ? (
            <div className="rounded-2xl border border-border bg-white p-10 text-center text-sm text-muted-foreground">
              None of your saved items are on sale right now.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-5">
              {shown.map((e) => <Card key={e.product.id} entry={e} />)}
            </div>
          )}
          <YouMayAlsoLike items={items.map((e) => e.product)} layout="grid" />
        </div>
      </div>
    </DesktopShell>
  );
}

function YouMayAlsoLike({ items, layout }: { items: Product[]; layout: "grid" | "scroll" }) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const limit = layout === "grid" ? 4 : 8;

  useEffect(() => {
    let cancelled = false;
    const exclude = items.map((p) => p.id);
    catalogApi
      .alsoLike(exclude, limit)
      .then((rows) => {
        if (cancelled) return;
        setSuggestions(
          (rows ?? []).map((p) => {
            rememberApiMeta(p);
            return mapApiProduct(p);
          })
        );
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [items.map((p) => p.id).join(","), limit]);

  if (suggestions.length === 0) return null;

  if (layout === "grid") {
    return (
      <section className="pt-6 border-t border-border">
        <h2 className="font-display font-bold text-lg mb-4">You May Also Like</h2>
        <div className="grid grid-cols-4 gap-5">
          {suggestions.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-8 pt-5 border-t border-border">
      <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-3">You May Also Like</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
        {suggestions.map((p) => (
          <div key={p.id} className="snap-start shrink-0 w-[42%]">
            <ProductCard product={p} compact />
          </div>
        ))}
      </div>
    </section>
  );
}


function Mobile() {
  const nav = useNavigate();
  const items = useWishlistProducts();
  const [filter, setFilter] = useState<WishFilter>("all");
  const saleItems = items.filter((e) => isOnSale(e.product));
  const shown = filter === "sale" ? saleItems : items;
  return (
    <MobileShell activeBottom="wishlist" headerVariant="shop" showTopTabs={false} leftIcon="menu">
      <div className="sticky top-[52px] z-20 bg-background border-b border-border">
        <div className="flex items-center justify-between px-3 py-3">
          <button onClick={() => nav({ to: "/account" })} aria-label="Back"><ArrowLeft className="h-5 w-5" /></button>
          <h1 className="font-display font-bold text-[15px]">My Wishlist</h1>
          <Heart className={`h-5 w-5 ${items.length > 0 ? "text-gold fill-gold" : "text-muted-foreground"}`} />
        </div>
      </div>
      <div className="px-4 py-4 pb-24">
        <div className="text-[12px] text-muted-foreground mb-3">{items.length} items saved</div>
        <FilterTabs value={filter} onChange={setFilter} counts={{ all: items.length, sale: saleItems.length }} />
        {filter === "sale" && (
          <div className="mt-4">
            <h2 className="font-display font-bold text-[15px]">Sale</h2>
            <p className="text-[12px] text-muted-foreground">Items with promotions from all your wishlist.</p>
          </div>
        )}
        {items.length === 0 ? <div className="mt-4"><EmptyState /></div> : shown.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-white p-8 text-center text-[12px] text-muted-foreground">
            None of your saved items are on sale right now.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {shown.map((e) => <Card key={e.product.id} entry={e} />)}
          </div>
        )}
        <YouMayAlsoLike items={items.map((e) => e.product)} layout="scroll" />
      </div>

    </MobileShell>
  );
}
