import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MobileShell } from "@/components/shell/MobileShell";
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

export function MobileHome() {
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
    <MobileShell activeTop="home" activeBottom="home">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <HeroCarousel fullScreen />
        <TrustBadges />
        <CategoryGrid />
        <ProductGrid title="Best Sellers" products={bestSellers.slice(0, 4)} />
        <PromoBanner
          tag="Coming Soon"
          title={"RESERVE\nBEFORE IT DROPS."}
          subtitle={
            nextDrop
              ? `${nextDrop.product.brand} ${nextDrop.product.name} lands ${formatDropDate(nextDrop.releaseAt)}. ${depositPct}% deposit secures your size.`
              : `Secure upcoming drops with a ${depositPct}% deposit.`
          }
          ctaLabel="View Drops"
          ctaTo="/coming-soon"
          secondaryCtaLabel={nextDrop ? "Reserve" : undefined}
          secondaryCtaTo={nextDrop ? `/drop/${nextDrop.id}` : undefined}
          image={nextDrop?.product.image ?? promoImage}
        />
        <ProductGrid title="New Arrivals" products={newArrivals.slice(0, 6)} />

        <ConciergeBanner />
        <TrendingCarousel limit={10} />
        <HomeEditSections />
      </motion.div>
    </MobileShell>
  );
}
