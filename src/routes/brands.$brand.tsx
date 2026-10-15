import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { useState } from "react";
import { ProductCard } from "@/components/shop/ProductCard";
import Pagination from "@/components/shop/Pagination";

const PER_PAGE = 12;
import { getAllBrands, getProductsByBrand, type Product } from "@/lib/shop-data";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/brands/$brand")({
  loader: async ({ params }) => {
    const slug = params.brand.toLowerCase();
    try {
      const brand = await catalogApi.getBrand(slug);
      const { items } = await catalogApi.listProducts({ brand: brand.handle || slug, pageSize: 100, sort: "featured" });
      const products = items.map((p) => {
        rememberApiMeta(p);
        return mapApiProduct(p);
      });
      return { brand: brand.name, products, fromApi: true };
    } catch {
      const match = getAllBrands().find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === slug
      );
      if (!match) throw notFound();
      return { brand: match.name, products: getProductsByBrand(match.name), fromApi: false };
    }
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.brand} - ASL ORIGINALS` : "Brand - ASL ORIGINALS";
    const description = loaderData
      ? `Shop ${loaderData.brand} at ASL ORIGINALS - ${loaderData.products.length} authentic pieces, delivered nationwide.`
      : "Brand collection at ASL ORIGINALS.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: BrandPage,
});

function BrandPage() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { brand, products } = Route.useLoaderData() as { brand: string; products: Product[] };
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const displayed = products.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);


  const content = (
    <div className={`${isDesktop ? "mx-auto max-w-[1400px] px-6" : "px-4"} py-6`}>
      <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
        <Link to="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/brands" className="hover:text-ink">Brands</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-medium">{brand}</span>
      </nav>

      <div className="mb-6">
        <div className="text-[11px] font-bold tracking-widest text-muted-foreground">BRAND</div>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-wide">{brand}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">{products.length} {products.length === 1 ? "piece" : "pieces"} available</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-[13px]">Nothing to show yet.</div>
      ) : (
        <div className={`grid ${isDesktop ? "grid-cols-4 gap-4" : "grid-cols-2 gap-3"}`}>
          {displayed.map((p) => (
            <div key={p.id} onClick={() => navigate({ to: "/product/$id", params: { id: p.id } })}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}

      {products.length > 0 && (
        <div className="mt-8">
          <Pagination page={currentPage} totalPages={totalPages} onChange={setPage} />
        </div>
      )}
    </div>
  );

  return isDesktop ? (
    <DesktopShell active="Shop">{content}</DesktopShell>
  ) : (
    <MobileShell activeBottom="shop" showTopTabs={false} headerVariant="shop">{content}</MobileShell>
  );
}
