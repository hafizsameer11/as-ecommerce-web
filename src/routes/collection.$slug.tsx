import { createFileRoute, notFound } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileCollection, DesktopCollection, type CollectionMeta } from "@/components/shop/CollectionView";
import { catalogApi } from "@/lib/api/catalog";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import heroModels from "@/assets/hero-models.jpg";

export const Route = createFileRoute("/collection/$slug")({
  loader: async ({ params }) => {
    try {
      const col = await catalogApi.getCollection(params.slug);
      return {
        slug: params.slug,
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
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    const apiMeta = loaderData?.meta;
    const title = `${apiMeta?.title ?? "Collection"} - ASL ORIGINALS`;
    const description = apiMeta?.tagline ?? "Shop curated collections at ASL ORIGINALS.";
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
  const { meta, products } = Route.useLoaderData();
  const isDesktop = useIsDesktop();

  return (
    <>
      {isDesktop ? <DesktopCollection meta={meta} products={products} /> : <MobileCollection meta={meta} products={products} />}
      <Toaster position="top-center" />
    </>
  );
}
