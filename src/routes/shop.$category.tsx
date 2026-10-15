import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopCategory } from "@/components/shop/DesktopCategory";
import { MobileCategory } from "@/components/shop/MobileCategory";
import { getCategoryName } from "@/lib/shop-data";

const searchSchema = z.object({
  sort: z.string().optional(),
  sub: z.string().optional(),
});

export const Route = createFileRoute("/shop/$category")({
  validateSearch: searchSchema,
  head: ({ params }) => {
    const category = getCategoryName(params.category);
    return {
      meta: [
        { title: `${category} - ASL ORIGINALS` },
        { name: "description", content: `Shop ${category.toLowerCase()} at ASL ORIGINALS. Authentic luxury streetwear, footwear, accessories and fragrances.` },
        { property: "og:title", content: `${category} - ASL ORIGINALS` },
        { property: "og:description", content: `Shop ${category.toLowerCase()} at ASL ORIGINALS.` },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const isDesktop = useIsDesktop();
  const { category } = Route.useParams();
  const { sub } = Route.useSearch();
  return (
    <>
      {isDesktop
        ? <DesktopCategory categoryId={category} initialSub={sub} />
        : <MobileCategory categoryId={category} initialSub={sub} />}
      <Toaster position="top-center" />
    </>
  );
}
