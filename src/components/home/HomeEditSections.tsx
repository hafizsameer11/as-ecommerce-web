import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ProductGrid } from "./ProductGrid";
import { PromoBanner } from "./PromoBanner";
import { fadeInUp } from "@/lib/motion";
import { useStoreProducts } from "@/lib/catalog-query";
import { defaultFilters } from "@/components/shop/ProductFilters";
import { catalogApi } from "@/lib/api/catalog";
import catFootwear from "@/assets/cat-footwear.jpg";
import pWatch from "@/assets/p-watch.jpg";
import catClothing from "@/assets/cat-clothing.jpg";
import bannerBrands from "@/assets/banner-brands.jpg";

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

export function HomeEditSections() {
  const sneakerEdit = useHomeRail("Sneakers & Trainers");
  const watchEdit = useHomeRail("Watches");
  const backInStock = useRestockedRail();

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

  return (
    <>
      <PromoBanner
        tag="Curated for you"
        title={"THE SNEAKER\nEDIT"}
        subtitle="Hand-picked silhouettes from the houses that matter."
        ctaLabel="Shop Sneakers"
        ctaTo="/shop"
        secondaryCtaLabel="All Brands"
        secondaryCtaTo="/brands"
        image={catFootwear}
      />
      <ProductGrid
        title="The Sneaker Edit"
        products={sneakerEdit.map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, image: p.image }))}
        viewAllTo="/shop"
      />

      <PromoBanner
        tag="Timepieces"
        title={"THE WATCH\nEDIT"}
        subtitle="Precision, heritage, and statement pieces for the wrist."
        ctaLabel="Shop Watches"
        ctaTo="/shop"
        secondaryCtaLabel="All Brands"
        secondaryCtaTo="/brands"
        image={pWatch}
      />
      <ProductGrid
        title="The Watch Edit"
        products={watchEdit.map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, image: p.image }))}
        viewAllTo="/shop"
      />

      <PromoBanner
        tag="Restocked"
        title={"BACK IN\nSTOCK"}
        subtitle="The pieces you asked for — returned in limited numbers."
        ctaLabel="Shop Restocks"
        ctaTo="/shop"
        secondaryCtaLabel="New Arrivals"
        secondaryCtaTo="/new-arrivals"
        image={catClothing}
      />
      <ProductGrid
        title="Back in Stock"
        products={backInStock.map((p) => ({ id: p.id, brand: p.brand, name: p.name, price: p.price, image: p.image }))}
        viewAllTo="/shop"
      />

      <PromoBanner
        tag="The Directory"
        title={"DISCOVER MORE\nBRANDS"}
        subtitle="From street icons to heritage houses — explore them all."
        ctaLabel="View All Brands"
        ctaTo="/brands"
        secondaryCtaLabel="Shop Now"
        secondaryCtaTo="/shop"
        image={bannerBrands}
      />
      {featuredBrands.length > 0 ? (
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={fadeInUp}
          className="px-2 pb-5 pt-2 md:px-6 md:pb-10 md:pt-3"
        >
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-3 flex items-center justify-between md:mb-6">
              <h2 className="text-sm font-display font-bold uppercase tracking-widest md:text-xl">
                Discover More Brands
              </h2>
              <Link to="/brands" className="text-xs text-muted-foreground hover:text-foreground">
                View all ›
              </Link>
            </div>
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
      ) : null}
    </>
  );
}
