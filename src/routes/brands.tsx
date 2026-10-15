import { createFileRoute } from "@tanstack/react-router";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { BrandDirectory, useAllBrandEntries } from "@/components/brands/BrandDirectory";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands - ASL ORIGINALS" },
      { name: "description", content: "Shop by brand - Nike, Amiri, Represent, Dior, Casio, Essentials and more, curated by ASL ORIGINALS." },
      { property: "og:title", content: "Brands - ASL ORIGINALS" },
      { property: "og:description", content: "Curated luxury brands available at ASL ORIGINALS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandsPage,
});

function BrandsPage() {
  const isDesktop = useIsDesktop();
  const brands = useAllBrandEntries();

  const content = (
    <BrandDirectory
      brands={brands}
      eyebrow="SHOP BY"
      title="All Brands"
      subtitleUnit="products in stock"
      isDesktop={isDesktop}
    />
  );

  return isDesktop ? (
    <DesktopShell active="Shop">{content}</DesktopShell>
  ) : (
    <MobileShell activeBottom="shop" showTopTabs={false} headerVariant="shop">{content}</MobileShell>
  );
}
