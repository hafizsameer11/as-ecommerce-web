import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileCategoryBrowse } from "@/components/shop/MobileCategoryBrowse";
import { DesktopShop } from "@/components/shop/DesktopShop";

export const Route = createFileRoute("/shop/browse")({
  validateSearch: z.object({
    open: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Browse Categories - ASL ORIGINALS" },
      { name: "description", content: "Browse all shop categories at ASL ORIGINALS." },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const isDesktop = useIsDesktop();
  const { open } = Route.useSearch();
  const initialOpen = open ? open.split(",") : ["clothing", "footwear"];
  return (
    <>
      {isDesktop ? <DesktopShop /> : <MobileCategoryBrowse initialOpen={initialOpen} />}
      <Toaster position="top-center" />
    </>
  );
}
