import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopProduct } from "@/components/product/DesktopProduct";
import { MobileProduct } from "@/components/product/MobileProduct";
import { getProductById, getProductRating } from "@/lib/shop-data";
import { hydrateShopCatalogFromApi } from "@/lib/catalog-hydrate";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";

export const Route = createFileRoute("/product/$id")({
  validateSearch: z.object({ concierge: z.boolean().optional() }),
  loader: async ({ params }) => {
    try {
      const dto = await catalogApi.getProduct(params.id);
      rememberApiMeta(dto);
      return { product: mapApiProduct(dto) };
    } catch {
      await hydrateShopCatalogFromApi().catch(() => undefined);
      const product = getProductById(params.id);
      if (!product) throw notFound();
      return { product };
    }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) {
      return { meta: [{ title: "Product - ASL ORIGINALS" }] };
    }
    const { rating, reviews } = getProductRating(p.id);
    const title = `${p.brand} ${p.name} - ASL ORIGINALS`;
    const description = `Shop the ${p.brand} ${p.name} at ASL ORIGINALS. 100% authentic luxury, delivered.`;
    const image = p.image;
    const url = `https://satin-signature-craft.lovable.app/product/${p.id}`;
    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: `${p.brand} ${p.name}`,
      image: [image],
      description,
      sku: p.id,
      brand: { "@type": "Brand", name: p.brand },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: "NGN",
        price: p.price,
        availability: "https://schema.org/InStock",
        itemCondition: "https://schema.org/NewCondition",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: reviews,
      },
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(jsonLd) },
      ],
    };
  },
  errorComponent: () => <div className="p-10 text-center">Something went wrong.</div>,
  notFoundComponent: () => <div className="p-10 text-center">Product not found.</div>,
  component: ProductPage,
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { concierge } = Route.useSearch();
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopProduct product={product} forceConcierge={concierge} /> : <MobileProduct product={product} forceConcierge={concierge} />}
      <Toaster position="top-center" />
    </>
  );
}
