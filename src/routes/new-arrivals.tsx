import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";

const PER_PAGE = 12;
import { useStoreProducts } from "@/lib/catalog-query";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/new-arrivals")({
  head: () => ({
    meta: [
      { title: "New Arrivals - ASL ORIGINALS" },
      { name: "description", content: "The latest drops at ASL ORIGINALS. Fresh fits, footwear, accessories and fragrances every week." },
      { property: "og:title", content: "New Arrivals - ASL ORIGINALS" },
      { property: "og:description", content: "Just in - the newest luxury pieces at ASL ORIGINALS." },
    ],
  }),
  component: NewArrivalsPage,
});

function NewArrivalsPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { products: displayed, meta } = useStoreProducts({
    preset: "new-arrivals",
    page,
    pageSize: PER_PAGE,
  });
  const total = meta.total ?? displayed.length;
  const totalPages = Math.max(1, meta.pageCount ?? 1);
  const currentPage = Math.min(page, totalPages);

  const content = (
    <div className={`${isDesktop ? "mx-auto max-w-[1400px] px-6" : "px-4"} py-6`}>
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-gold uppercase mb-1">
          <Sparkles className="h-3 w-3" /> Just Landed
        </div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-wide">New Arrivals</h1>
        <p className="text-[12px] text-muted-foreground mt-1">Fresh drops this week · {total} styles</p>
      </div>

      <div className={`grid ${isDesktop ? "grid-cols-4 gap-4" : "grid-cols-2 gap-3"}`}>
        {displayed.map((p) => (
          <div key={p.id} onClick={() => navigate({ to: "/product/$id", params: { id: p.id } })}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  );

  return isDesktop ? (
    <DesktopShell active="Shop">{content}</DesktopShell>
  ) : (
    <MobileShell activeBottom="shop" showTopTabs={false} headerVariant="shop">{content}</MobileShell>
  );
}
