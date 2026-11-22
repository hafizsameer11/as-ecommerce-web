import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProductGrid } from "./ProductGrid";
import { PromoBanner } from "./PromoBanner";
import { fadeInUp } from "@/lib/motion";
import { useStoreProducts } from "@/lib/catalog-query";
import { defaultFilters } from "@/components/shop/ProductFilters";
import { catalogApi } from "@/lib/api/catalog";
import { useCatalogVersion } from "@/lib/catalog-version";
import {
  homeSlots,
  isBackInStockSlot,
  isBrandsSlot,
  isComingSoonSlot,
  isConciergeSlot,
  isSneakerEditSlot,
  isWatchEditSlot,
} from "@/lib/home-merch";
import type { HomeSlot } from "@/lib/api/catalog";
import catFootwear from "@/assets/cat-footwear.jpg";
import pWatch from "@/assets/p-watch.jpg";
import catClothing from "@/assets/cat-clothing.jpg";
import bannerBrands from "@/assets/banner-brands.jpg";
import concierge from "@/assets/concierge.jpg";
import promoImage from "@/assets/hero-sneakers.jpg";

function useHomeRail(subcategory: string, pageSize = 5) {
  const { products } = useStoreProducts({ subcategory, pageSize, sort: "featured" });
  return products;
}

function useRestockedRail(pageSize = 5) {
  const { products } = useStoreProducts({
    pageSize,
    sort: "featured",
    filters: { ...defaultFilters, availability: ["Restocked"] },
  });
  return products;
}

function SlotBanner({
  slot,
  fallbackImage,
}: {
  slot: HomeSlot;
  fallbackImage: string;
}) {
  return (
    <PromoBanner
      tag={slot.eyebrow ?? "Exclusive"}
      title={slot.headline ?? ""}
      subtitle={slot.subhead ?? undefined}
      ctaLabel={slot.cta ?? "Shop Now"}
      ctaTo={slot.linkTo || "/shop"}
      secondaryCtaLabel={slot.secondaryCta ?? undefined}
      secondaryCtaTo={slot.secondaryLinkTo ?? undefined}
      image={slot.imageUrl || fallbackImage}
    />
  );
}

function BrandsStrip() {
  const [featuredBrands, setFeaturedBrands] = useState<{ name: string; image: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    catalogApi
      .brands()
      .then((rows) => {
        if (cancelled || !rows?.length) return;
        setFeaturedBrands(
          rows
            .filter((b) => b.image)
            .slice(0, 5)
            .map((b) => ({ name: b.name.toUpperCase(), image: b.image! }))
        );
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (!featuredBrands.length) return null;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="px-2 pb-5 pt-2 md:px-6 md:pb-10 md:pt-3"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-4">
          {featuredBrands.map((brand) => (
            <Link
              key={brand.name}
              to="/brands/$brand"
              params={{ brand: brand.name.toLowerCase().replaceAll(" ", "-") }}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={brand.image}
                alt={`${brand.name} collection`}
                loading="lazy"
                className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-ink/90 px-3 py-2 text-center text-[10px] font-bold tracking-widest text-white md:text-xs">
                {brand.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function toTeasers(products: { id: string; brand: string; name: string; price: number; image: string }[]) {
  return products.map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, image: p.image }));
}

/**
 * Mid-home merchandising driven by CMS slots.
 * Each editorial banner is followed by a product rail without repeating the same title.
 */
export function HomeEditSections() {
  useCatalogVersion((s) => s.v);
  const sneakerEdit = useHomeRail("Sneakers & Trainers");
  const watchEdit = useHomeRail("Watches");
  const backInStock = useRestockedRail();

  const slots = homeSlots.length
    ? homeSlots
    : ([
        {
          id: "fallback_sneaker",
          type: "editorial",
          eyebrow: "Curated for you",
          headline: "THE SNEAKER\nEDIT",
          subhead: "Hand-picked silhouettes from the houses that matter.",
          cta: "Shop Sneakers",
          linkTo: "/shop",
          secondaryCta: "All Brands",
          secondaryLinkTo: "/brands",
          imageUrl: catFootwear,
        },
        {
          id: "fallback_watch",
          type: "editorial",
          eyebrow: "Timepieces",
          headline: "THE WATCH\nEDIT",
          subhead: "Precision, heritage, and statement pieces for the wrist.",
          cta: "Shop Watches",
          linkTo: "/shop",
          secondaryCta: "All Brands",
          secondaryLinkTo: "/brands",
          imageUrl: pWatch,
        },
        {
          id: "fallback_stock",
          type: "editorial",
          eyebrow: "Restocked",
          headline: "BACK IN\nSTOCK",
          subhead: "The pieces you asked for — returned in limited numbers.",
          cta: "Shop Restocks",
          linkTo: "/shop",
          secondaryCta: "New Arrivals",
          secondaryLinkTo: "/new-arrivals",
          imageUrl: catClothing,
        },
        {
          id: "fallback_brands",
          type: "banner",
          eyebrow: "The Directory",
          headline: "DISCOVER MORE\nBRANDS",
          subhead: "From street icons to heritage houses — explore them all.",
          cta: "View All Brands",
          linkTo: "/brands",
          secondaryCta: "Shop Now",
          secondaryLinkTo: "/shop",
          imageUrl: bannerBrands,
        },
      ] satisfies HomeSlot[]);

  // Coming soon + concierge are rendered by Desktop/Mobile home before this block.
  const midSlots = slots.filter((s) => !isComingSoonSlot(s) && !isConciergeSlot(s));

  return (
    <>
      {midSlots.map((slot) => {
        if (isSneakerEditSlot(slot)) {
          return (
            <div key={slot.id}>
              <SlotBanner slot={slot} fallbackImage={catFootwear} />
              <ProductGrid products={toTeasers(sneakerEdit)} viewAllTo="/shop" />
            </div>
          );
        }
        if (isWatchEditSlot(slot)) {
          return (
            <div key={slot.id}>
              <SlotBanner slot={slot} fallbackImage={pWatch} />
              <ProductGrid products={toTeasers(watchEdit)} viewAllTo="/shop" />
            </div>
          );
        }
        if (isBackInStockSlot(slot)) {
          return (
            <div key={slot.id}>
              <SlotBanner slot={slot} fallbackImage={catClothing} />
              <ProductGrid products={toTeasers(backInStock)} viewAllTo="/shop" />
            </div>
          );
        }
        if (isBrandsSlot(slot)) {
          return (
            <div key={slot.id}>
              <SlotBanner slot={slot} fallbackImage={bannerBrands} />
              <BrandsStrip />
            </div>
          );
        }
        return <SlotBanner key={slot.id} slot={slot} fallbackImage={promoImage} />;
      })}
    </>
  );
}

export function ComingSoonSlotBanner({ depositFallback }: { depositFallback: string }) {
  useCatalogVersion((s) => s.v);
  const slot = homeSlots.find(isComingSoonSlot);
  if (slot) {
    return (
      <SlotBanner
        slot={{
          ...slot,
          subhead: slot.subhead || depositFallback,
        }}
        fallbackImage={promoImage}
      />
    );
  }
  return null;
}

export function ConciergeSlotBanner() {
  useCatalogVersion((s) => s.v);
  const slot = homeSlots.find(isConciergeSlot);
  if (slot) return <SlotBanner slot={slot} fallbackImage={concierge} />;
  return (
    <PromoBanner
      tag="Concierge"
      title={"FASHION\nCONCIERGE"}
      ctaLabel="Start Request"
      ctaTo="/start-request"
      secondaryCtaLabel="How It Works"
      secondaryCtaTo="/how-it-works"
      image={concierge}
    />
  );
}
