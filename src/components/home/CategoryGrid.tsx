import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { categories } from "@/lib/mock-data";
import { fadeInUp, staggerContainer, staggerItem, cardHover, imageZoom, buttonTap } from "@/lib/motion";
import { useCatalogVersion } from "@/lib/catalog-version";

export function CategoryGrid() {
  useCatalogVersion((s) => s.v);
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      className="px-2 md:px-6 py-6 md:py-14"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <h2 className="text-sm md:text-2xl font-display font-bold tracking-widest uppercase md:mx-auto md:text-center md:flex-1">
            Shop by Category
          </h2>
          <Link
            to="/shop"
            className="md:hidden text-xs text-muted-foreground"
          >
            <motion.span
              whileHover={{ x: 3 }}
              whileTap="tap"
              variants={buttonTap}
              className="inline-block"
            >
              View all
            </motion.span>
          </Link>
        </div>

        {/* Mobile: 4-across circular thumbnails with label below */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="grid grid-cols-4 gap-2 md:hidden"
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ open: c.id }}
              className="group flex flex-col items-center gap-2"
            >
              <motion.div
                variants={staggerItem}
                whileHover="hover"
                whileTap="tap"
                className="relative aspect-square w-full overflow-hidden rounded-full bg-ink"
              >
                <motion.img
                  variants={imageZoom}
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </motion.div>
              <div className="text-[11px] font-semibold tracking-wider uppercase text-center">
                {c.name}
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Desktop: large image cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="hidden md:grid grid-cols-4 gap-5"
        >
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/shop"
              search={{ open: c.id }}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-ink text-left"
            >
              <motion.div
                variants={staggerItem}
                whileHover="hover"
                whileTap="tap"
                className="absolute inset-0"
              >
                <motion.img
                  variants={imageZoom}
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="text-lg font-display font-bold tracking-widest uppercase">
                    {c.name}
                  </div>
                  <div className="mt-2 inline-block border border-white/60 px-3 py-1 text-[10px] tracking-widest uppercase">
                    View Collection
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
