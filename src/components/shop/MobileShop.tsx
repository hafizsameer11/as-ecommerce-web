import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/shell/MobileShell";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { staggerContainer, imageZoom, cardHover } from "@/lib/motion";
import { subCategories } from "@/lib/shop-data";
import pSneaker from "@/assets/p-sneaker.png";
import pCap from "@/assets/p-cap.png";
import pHoodie from "@/assets/p-hoodie.png";
import pTee from "@/assets/p-tee.png";
import pFragrance from "@/assets/p-fragrance.png";

type Cat = {
  id: string;
  name: string;
  sub: string;
  img?: string;
  variant?: "sales" | "concierge";
  hasItems?: boolean;
};

const cats: Cat[] = [
  { id: "clothing", name: "CLOTHING", sub: "Explore all", img: pTee, hasItems: true },
  { id: "footwear", name: "FOOTWEAR", sub: "Explore all", img: pSneaker, hasItems: true },
  { id: "accessories", name: "ACCESSORIES", sub: "Explore all", img: pCap, hasItems: true },
  { id: "fragrances", name: "FRAGRANCES", sub: "Explore all", img: pFragrance, hasItems: true },
  { id: "sales", name: "SALES", sub: "Shop deals", variant: "sales" },
  { id: "concierge", name: "FASHION CONCIERGE", sub: "Personal styling just for you", variant: "concierge" },
];

const featureCards = [
  { title: "BEST SELLERS", to: "/best-sellers" as const, img: pHoodie, img2: pSneaker },
  { title: "NEW ARRIVALS", to: "/new-arrivals" as const, img: pCap, img2: null },
];

export function MobileShop({ initialOpen }: { initialOpen?: string } = {}) {
  const [open, setOpen] = useState<string[]>(initialOpen ? [initialOpen] : []);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!initialOpen) return;
    setOpen((prev) => (prev.includes(initialOpen) ? prev : [...prev, initialOpen]));
    const el = itemRefs.current[initialOpen];
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }, [initialOpen]);

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  return (
    <MobileShell activeTop="shop" activeBottom="shop" headerVariant="shop" showTopTabs={false}>
      {/* Hero - real rotating carousel */}
      <div className="px-4 pt-3">
        <HeroCarousel compact />
      </div>

      {/* Two feature cards */}
      <div className="px-4 pt-3 grid grid-cols-2 gap-3">
        {featureCards.map((c, idx) => (
          <Link key={c.title} to={c.to}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.1, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              whileHover="hover"
              whileTap="tap"
              variants={cardHover}
              className="relative overflow-hidden rounded-xl bg-[#efece6] p-3 text-left h-[100px] cursor-pointer"
            >
              <div className="text-[10px] font-display font-bold tracking-[0.15em] text-ink">{c.title}</div>
              <div className="text-[9px] mt-2 font-semibold tracking-widest uppercase text-ink underline underline-offset-2">
                Shop Now →
              </div>
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
                {c.img2 && <motion.img variants={imageZoom} src={c.img2} alt="" className="h-16 w-16 object-contain" />}
                <motion.img variants={imageZoom} src={c.img} alt="" className="h-16 w-16 object-contain" />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Shop by Category */}
      <div className="mt-6">
        <div className="px-4 mb-2">
          <h2 className="text-xs font-display font-bold tracking-[0.25em] uppercase">Shop by Category</h2>
        </div>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          className="divide-y divide-border border-y border-border"
        >
          {cats.map((c) => {
            const isOpen = open.includes(c.id);
            const expandable = !!c.hasItems;
            const subs = expandable ? (subCategories[c.id] ?? []).filter((s) => !s.toLowerCase().startsWith("all")) : [];
            const catHref =
              c.variant === "sales" ? "/shop/sales" :
              c.variant === "concierge" ? "/concierge-service" :
              `/shop/${c.id}`;

            return (
              <div key={c.id} ref={(el) => { itemRefs.current[c.id] = el; }}>
                <div className="w-full flex items-center gap-4 px-4 py-3.5 bg-background text-left">
                  <Link to={catHref} className="flex flex-1 items-center gap-4 min-w-0">
                    <div className="h-12 w-12 shrink-0 grid place-items-center bg-[#efece6] rounded-sm overflow-hidden">
                      {c.variant === "sales" ? (
                        <div className="relative h-8 w-8 rotate-[-8deg] bg-ink grid place-items-center rounded-[3px]">
                          <span className="text-white text-sm font-display font-bold leading-none">%</span>
                          <span className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white" />
                        </div>
                      ) : c.variant === "concierge" ? (
                        <div className="text-center leading-none">
                          <div className="font-display font-bold text-[10px] tracking-[0.1em] text-ink">ASL</div>
                          <div className="text-[6px] tracking-[0.2em] text-ink/60 mt-0.5">CONCIERGE</div>
                        </div>
                      ) : (
                        <img src={c.img} alt="" className="h-10 w-10 object-contain" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-display font-bold tracking-[0.15em] uppercase">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</div>
                    </div>
                  </Link>
                  <div className="shrink-0">
                    {expandable ? (
                      <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggle(c.id)} className="p-1" aria-label="Toggle">
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </motion.button>
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {expandable && isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden bg-background"
                    >
                      <div className="pb-2">
                        <Link
                          to="/shop/$category"
                          params={{ category: c.id }}
                          className="block px-[80px] py-2.5 text-[13px] font-semibold text-ink hover:bg-muted"
                        >
                          All {c.name.toLowerCase()}
                        </Link>
                        {subs.map((sub) => (
                          <Link
                            key={sub}
                            to="/shop/$category"
                            params={{ category: c.id }}
                            search={{ sub }}
                            className="w-full block text-left px-[80px] py-2.5 text-[13px] text-foreground/80 hover:bg-muted"
                          >
                            {sub}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="h-6" />
    </MobileShell>
  );
}
