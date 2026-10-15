import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { TrustBadges } from "@/components/home/TrustBadges";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { fadeInUp, staggerContainer, staggerItem, cardHover, imageZoom, buttonTap } from "@/lib/motion";
import pSneaker from "@/assets/p-sneaker.png";
import pCap from "@/assets/p-cap.png";
import pHoodie from "@/assets/p-hoodie.png";
import pTee from "@/assets/p-tee.png";
import pFragrance from "@/assets/p-fragrance.png";

const cats = [
  { id: "clothing", name: "Clothing", cta: "Explore Now", img: pTee },
  { id: "footwear", name: "Footwear", cta: "Explore Now", img: pSneaker },
  { id: "accessories", name: "Accessories", cta: "Explore Now", img: pCap },
  { id: "fragrances", name: "Fragrances", cta: "Explore Now", img: pFragrance },
];

export function DesktopShop() {
  return (
    <DesktopShell active="Shop">
      {/* Hero - real rotating carousel */}
      <section className="px-6 pt-4">
        <div className="mx-auto max-w-[1600px]">
          <HeroCarousel />
        </div>
      </section>


      {/* Two feature cards */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeInUp}
        className="px-6 pt-5"
      >
        <div className="mx-auto max-w-[1600px] grid md:grid-cols-2 gap-5">
          {[
            { title: "BEST SELLERS", to: "/best-sellers" as const, sub: "Our most loved pieces.", img: pHoodie, img2: pSneaker, dark: false },
            { title: "NEW ARRIVALS", to: "/new-arrivals" as const, sub: "Fresh drops just landed.", img: pCap, img2: null, dark: true },
          ].map((c) => (
            <Link key={c.title} to={c.to}>
              <motion.div
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={cardHover}
                className={`relative overflow-hidden rounded-xl p-7 h-[190px] text-left cursor-pointer ${
                  c.dark ? "bg-ink text-white" : "bg-[#efece6] text-ink"
                }`}
              >
                <div className="text-base font-display font-bold tracking-[0.2em]">{c.title}</div>
                <div className={`text-xs mt-2 ${c.dark ? "text-white/70" : "text-ink/60"}`}>{c.sub}</div>
                <div className={`mt-4 text-[11px] uppercase tracking-[0.25em] font-bold underline underline-offset-4 ${c.dark ? "text-white" : "text-ink"}`}>
                  Shop Now →
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {c.img2 && <motion.img variants={imageZoom} src={c.img2} alt="" className="h-36 w-40 object-contain" />}
                  <motion.img variants={imageZoom} src={c.img} alt="" className="h-36 w-40 object-contain" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

      </motion.section>

      {/* Shop by Category */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeInUp}
        className="px-6 py-10"
      >
        <div className="mx-auto max-w-[1600px]">
          <h2 className="text-sm font-display font-bold tracking-[0.25em] uppercase mb-5">
            Shop by Category
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="grid grid-cols-2 md:grid-cols-6 gap-4"
          >
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/shop/$category"
                params={{ category: c.id }}
              >
                <motion.div
                  variants={staggerItem}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="group flex flex-col bg-[#efece6] p-4 rounded-xl h-full"
                >
                  <motion.div variants={cardHover} className="aspect-square flex items-center justify-center">
                    <motion.img
                      variants={imageZoom}
                      src={c.img}
                      alt={c.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </motion.div>
                  <div className="text-center mt-2">
                    <div className="text-xs font-display font-bold tracking-[0.25em] uppercase">
                      {c.name}
                    </div>
                    <div className="text-[10px] mt-1 text-muted-foreground">{c.cta} →</div>
                  </div>
                </motion.div>
              </Link>
            ))}
            <Link to="/shop/sales">
              <motion.div
                variants={staggerItem}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="group flex flex-col bg-[#efece6] p-4 rounded-xl h-full"
              >
                <motion.div variants={cardHover} className="aspect-square flex items-center justify-center">
                  <div className="relative">
                    <div className="h-24 w-24 rotate-[-8deg] bg-ink grid place-items-center rounded-sm relative">
                      <span className="text-white text-4xl font-display font-bold">%</span>
                      <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-white" />
                    </div>
                  </div>
                </motion.div>
                <div className="text-center mt-2">
                  <div className="text-xs font-display font-bold tracking-[0.25em] uppercase">SALES</div>
                  <div className="text-[10px] mt-1 text-muted-foreground">Shop Deals →</div>
                </div>
              </motion.div>
            </Link>
            <Link to="/concierge-service">
              <motion.div
                variants={staggerItem}
                whileHover={{ opacity: 0.92, y: -4 }}
                whileTap="tap"
                className="group flex flex-col bg-ink text-white p-4 rounded-xl items-center justify-center text-center h-full cursor-pointer"
              >
                <div className="font-display font-bold text-[15px] tracking-[0.14em] leading-none whitespace-nowrap">ASL ORIGINALS</div>
                <div className="text-[9px] tracking-[0.3em] text-white/60 mt-0.5">CONCIERGE</div>
                <div className="mt-4 text-xs font-display font-bold tracking-[0.2em] uppercase leading-tight">
                  Fashion<br />Concierge
                </div>
                <div className="text-[10px] mt-2 text-white/60 leading-snug">
                  Personal styling<br />just for you.
                </div>
                <div className="mt-3 text-[10px] uppercase tracking-[0.25em] text-gold underline underline-offset-4 font-semibold">
                  Get Started
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <TrustBadges />
    </DesktopShell>
  );
}
