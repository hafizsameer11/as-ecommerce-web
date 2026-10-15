import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopCategoriesList } from "@/components/categories/DesktopCategoriesList";
import { MobileCategoriesList } from "@/components/categories/MobileCategoriesList";

export const Route = createFileRoute("/concierge-categories")({
  head: () => ({
    meta: [
      { title: "Concierge Categories - ASL ORIGINALS" },
      { name: "description", content: "Browse every concierge category ASL ORIGINALS can source - sneakers, luxury fashion, watches, bags, eyewear, fragrance, tech and more." },
      { property: "og:title", content: "Concierge Categories - ASL ORIGINALS" },
      { property: "og:description", content: "Request any fashion item. From exclusive pieces to sold-out items, we source it for you." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopCategoriesList /> : <MobileCategoriesList />}
      <Toaster position="top-center" />
    </>
  );
}
