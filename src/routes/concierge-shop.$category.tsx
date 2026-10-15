import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { ConciergeCatalog } from "@/components/concierge/ConciergeCatalog";
import { getConciergeCategory } from "@/lib/concierge-catalog";

export const Route = createFileRoute("/concierge-shop/$category")({
  head: ({ params }) => {
    const cat = getConciergeCategory(params.category);
    const title = `${cat?.title ?? "Concierge"} - Concierge Sourcing | ASL ORIGINALS`;
    const description = cat?.desc ?? "Request any luxury piece and ASL ORIGINALS will source it for you.";
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
  component: ConciergeCatalogPage,
});

function ConciergeCatalogPage() {
  const { category } = Route.useParams();
  const isDesktop = useIsDesktop();
  return (
    <>
      <ConciergeCatalog categoryId={category} desktop={isDesktop} />
      <Toaster position="top-center" />
    </>
  );
}
