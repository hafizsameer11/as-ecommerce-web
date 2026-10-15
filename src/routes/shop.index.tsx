import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { z } from "zod";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileShop } from "@/components/shop/MobileShop";
import { DesktopShop } from "@/components/shop/DesktopShop";

const searchSchema = z.object({
  open: z.string().optional(),
});

export const Route = createFileRoute("/shop/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Shop - ASL ORIGINALS" },
      { name: "description", content: "Browse categories, best sellers, trending now, and brands at ASL ORIGINALS." },
      { property: "og:title", content: "Shop - ASL ORIGINALS" },
      { property: "og:description", content: "Browse categories, best sellers, trending now, and brands at ASL ORIGINALS." },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const isDesktop = useIsDesktop();
  const { open } = Route.useSearch();
  return (
    <>
      {isDesktop ? <DesktopShop /> : <MobileShop initialOpen={open} />}
      <Toaster position="top-center" />
    </>
  );
}
