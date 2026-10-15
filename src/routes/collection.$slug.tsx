import { createFileRoute, notFound } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileCollection, DesktopCollection, type CollectionMeta } from "@/components/shop/CollectionView";
import { getAllProducts, getNewArrivals, isConciergeProduct, type Product } from "@/lib/shop-data";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import conciergeHero from "@/assets/concierge-hero.jpg";
import heroBag from "@/assets/hero-bag.jpg";
import heroModels from "@/assets/hero-models.jpg";

type CollectionDef = CollectionMeta & { products: () => Product[] };

const localCollections: Record<string, CollectionDef> = {
  "private-sourcing": {
    title: "Private Sourcing",
    eyebrow: "Private Sourcing",
    tagline: "Exclusive, limited and sold-out pieces sourced privately for you by our concierge team.",
    heroImage: heroBag,
    conciergeMode: true,
    products: () => {
      const all = getAllProducts();
      const picks = all.filter(isConciergeProduct);
      return picks.length >= 8 ? picks : all;
    },
  },
  "fashion-concierge-edit": {
    title: "Fashion Concierge Edit",
    eyebrow: "Fashion Concierge",
    tagline: "A weekly edit curated by our concierge team - the pieces worth requesting now.",
    heroImage: conciergeHero,
    conciergeMode: true,
    products: () => {
      const all = getAllProducts();
      const picks = all.filter(isConciergeProduct);
      return picks.length >= 8 ? picks : all;
    },
  },
  "new-season": {
    title: "New Season",
    eyebrow: "New Season",
    tagline: "The newest arrivals of the season across clothing, footwear, accessories and fragrance.",
    heroImage: heroModels,
    products: () => getNewArrivals(60),
  },
};

export const Route = createFileRoute("/collection/$slug")({
  loader: async ({ params }) => {
    try {
      const col = await catalogApi.getCollection(params.slug);
      return {
        slug: params.slug,
        fromApi: true as const,
        meta: {
          title: col.title,
          eyebrow: col.title,
          tagline: col.description || `Shop ${col.title} at ASL ORIGINALS.`,
          heroImage: col.cover || heroModels,
          conciergeMode: false,
        } satisfies CollectionMeta,
        products: (col.products ?? []).map((p) => {
          rememberApiMeta(p);
          return mapApiProduct(p);
        }),
      };
    } catch {
      if (!localCollections[params.slug]) throw notFound();
      return { slug: params.slug, fromApi: false as const };
    }
  },
  head: ({ params, loaderData }) => {
    const local = localCollections[params.slug];
    const apiMeta = loaderData && "meta" in loaderData ? loaderData.meta : undefined;
    const title = `${apiMeta?.title ?? local?.title ?? "Collection"} - ASL ORIGINALS`;
    const description = apiMeta?.tagline ?? local?.tagline ?? "Shop curated collections at ASL ORIGINALS.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CollectionPage,
});

function CollectionPage() {
  const data = Route.useLoaderData();
  const isDesktop = useIsDesktop();
  const [products, setProducts] = useState<Product[]>(
    data.fromApi && "products" in data ? data.products : localCollections[data.slug]?.products() ?? []
  );
  const meta: CollectionMeta =
    data.fromApi && "meta" in data
      ? data.meta
      : {
          title: localCollections[data.slug]!.title,
          eyebrow: localCollections[data.slug]!.eyebrow,
          tagline: localCollections[data.slug]!.tagline,
          heroImage: localCollections[data.slug]!.heroImage,
          conciergeMode: localCollections[data.slug]!.conciergeMode,
        };

  useEffect(() => {
    if (data.fromApi && "products" in data) {
      setProducts(data.products);
      return;
    }
    setProducts(localCollections[data.slug]?.products() ?? []);
  }, [data]);

  return (
    <>
      {isDesktop ? <DesktopCollection meta={meta} products={products} /> : <MobileCollection meta={meta} products={products} />}
      <Toaster position="top-center" />
    </>
  );
}
