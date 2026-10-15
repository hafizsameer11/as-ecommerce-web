import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { MobileShell } from "@/components/shell/MobileShell";
import { BrandDirectory, useAllBrandEntries } from "@/components/brands/BrandDirectory";

export const Route = createFileRoute("/concierge-brands")({
  head: () => ({
    meta: [
      { title: "Concierge Brands - ASL ORIGINALS" },
      { name: "description", content: "Explore the luxury brands our fashion concierge sources - exclusive, limited and sold-out pieces requested on your behalf." },
      { property: "og:title", content: "Concierge Brands - ASL ORIGINALS" },
      { property: "og:description", content: "Explore every brand available through the ASL ORIGINALS fashion concierge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConciergeBrandsPage,
});

function ConciergeBrandsPage() {
  const isDesktop = useIsDesktop();
  const brands = useAllBrandEntries();

  const breadcrumb = (
    <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-4">
      <Link to="/" className="hover:text-ink">Home</Link>
      <ChevronRight className="h-3 w-3" />
      <Link to="/concierge-categories" className="hover:text-ink">Concierge</Link>
      <ChevronRight className="h-3 w-3" />
      <span className="text-ink font-medium">Brands</span>
    </nav>
  );

  const content = (
    <BrandDirectory
      brands={brands}
      eyebrow="FASHION CONCIERGE"
      title="Explore Brands"
      subtitleUnit="pieces we can source for you"
      cardTag="Fashion Concierge"
      isDesktop={isDesktop}
      breadcrumb={breadcrumb}
    />
  );

  return isDesktop ? (
    <DesktopShell active="Shop">{content}</DesktopShell>
  ) : (
    <MobileShell activeBottom="shop" showTopTabs={false} headerVariant="shop">{content}</MobileShell>
  );
}
