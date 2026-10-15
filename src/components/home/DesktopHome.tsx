import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { HeroCarousel } from "./HeroCarousel";
import { TrustBadges } from "./TrustBadges";
import { CategoryGrid } from "./CategoryGrid";
import { ProductGrid } from "./ProductGrid";
import { ConciergeBanner } from "./ConciergeBanner";
import { TrendingCarousel } from "./TrendingCarousel";
import { HomeEditSections } from "./HomeEditSections";
import { PromoBanner } from "./PromoBanner";
import promoImage from "@/assets/hero-sneakers.jpg";
import { bestSellers, newArrivals } from "@/lib/mock-data";
import { getDrops, formatDropDate, hydrateDrops, subscribeDrops } from "@/lib/coming-soon";
import { useCatalogVersion } from "@/lib/catalog-version";
import { usePublicSettings } from "@/lib/api/settings";
import { defaultDepositPct } from "@/lib/public-settings-format";

export function DesktopHome() {
  useCatalogVersion((s) => s.v);
  const [, tick] = useState(0);
  useEffect(() => {
    void hydrateDrops();
    return subscribeDrops(() => tick((n) => n + 1));
  }, []);
  const nextDrop = getDrops()[0];
  const { data: publicSettings } = usePublicSettings();
  const depositPct = nextDrop?.depositPct ?? defaultDepositPct(publicSettings);
  void tick;
  return (
    <DesktopShell active="Home">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <HeroCarousel fullScreen />
        <TrustBadges />
        <div className="mx-auto max-w-[1600px]">
          <CategoryGrid />
          <ProductGrid title="Best Sellers" products={bestSellers.slice(0, 5)} />
          <PromoBanner
            tag="Coming Soon"
            title={"RESERVE\nBEFORE IT DROPS."}
            subtitle={
              nextDrop
                ? `${nextDrop.product.brand} ${nextDrop.product.name} lands ${formatDropDate(nextDrop.releaseAt)}. Secure your size with a ${depositPct}% deposit.`
                : `Secure upcoming drops with a ${depositPct}% deposit. Balance payable on release day.`
            }
            ctaLabel="View Drops"
            ctaTo="/coming-soon"
            secondaryCtaLabel={nextDrop ? "Reserve Now" : undefined}
            secondaryCtaTo={nextDrop ? `/drop/${nextDrop.id}` : undefined}
            image={nextDrop?.product.image ?? promoImage}
          />
          <ProductGrid title="New Arrivals" products={newArrivals.slice(0, 5)} />
          <ConciergeBanner />
          <TrendingCarousel limit={12} />
          <HomeEditSections />
        </div>
      </motion.div>
    </DesktopShell>
  );
}
