import { createFileRoute, notFound } from "@tanstack/react-router";
import { MobileProduct } from "@/components/product/MobileProduct";
import { DesktopProduct } from "@/components/product/DesktopProduct";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { formatDropDate, getDropById, hydrateDrops } from "@/lib/coming-soon";
import { loyaltyApi, koboToNaira, type ApiDrop } from "@/lib/api/loyalty";
import { mapApiProduct, rememberApiMeta } from "@/lib/api/product-mapper";
import type { ApiProductCard } from "@/lib/api/catalog";
import type { Drop } from "@/lib/coming-soon";

function mapOne(d: ApiDrop): Drop {
  const card = {
    id: d.product.id,
    productId: d.product.productId,
    brand: d.product.brand,
    name: d.product.name,
    price: d.product.price,
    image: d.product.image,
    category: d.product.category ?? "drops",
    sizes: d.product.sizes ?? [],
    colors: [],
    availability: "Pre Order",
    isConcierge: false,
  } as unknown as ApiProductCard;
  rememberApiMeta(card);
  const product = mapApiProduct(card);
  const pct = d.depositPct ?? 50;
  const deposit = d.deposit != null ? koboToNaira(d.deposit) : Math.round(product.price * (pct / 100));
  const balance = d.balance != null ? koboToNaira(d.balance) : product.price - deposit;
  return {
    id: d.id,
    product,
    releaseAt: typeof d.releaseAt === "string" ? d.releaseAt : new Date(d.releaseAt).toISOString(),
    allocation: d.allocation,
    reservedCount: d.reservedCount,
    teaser: d.teaser || "Limited allocation — reserve early.",
    depositPct: pct,
    deposit,
    balance,
  };
}

export const Route = createFileRoute("/drop/$dropId")({
  loader: async ({ params }) => {
    await hydrateDrops();
    let drop = getDropById(params.dropId);
    if (!drop) {
      try {
        drop = mapOne(await loyaltyApi.getDrop(params.dropId));
      } catch {
        throw notFound();
      }
    }
    if (!drop) throw notFound();
    return { drop };
  },
  head: ({ loaderData }) => {
    const d = loaderData?.drop;
    if (!d) {
      return {
        meta: [
          { title: "Drop Unavailable - ASL ORIGINALS" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${d.product.brand} ${d.product.name} - Reserve with 50% | ASL ORIGINALS`;
    const description = `Reserve the ${d.product.brand} ${d.product.name} ahead of its ${formatDropDate(
      d.releaseAt,
    )} release with a 50% deposit. Balance payable on release day.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
      ],
    };
  },
  notFoundComponent: () => <div className="p-10 text-center">Drop not found.</div>,
  errorComponent: () => <div className="p-10 text-center">Something went wrong.</div>,
  component: DropPage,
});

function DropPage() {
  const { drop } = Route.useLoaderData();
  const isDesktop = useIsDesktop();
  return isDesktop ? (
    <DesktopProduct product={drop.product} drop={drop} />
  ) : (
    <MobileProduct product={drop.product} drop={drop} />
  );
}
