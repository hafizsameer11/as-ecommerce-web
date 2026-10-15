import { MobileShell } from "@/components/shell/MobileShell";
import { motion } from "framer-motion";
import { goToLabel } from "@/lib/nav-resolve";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Menu, ShoppingBag, Home, Grid3x3, Plus, MapPin, User, ArrowRight, MessageCircle,
  ShieldCheck, Truck, Headphones, ChevronRight,
} from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { staggerContainer, staggerItem, cardHover, imageZoom, buttonTap, fadeInUp } from "@/lib/motion";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductCard } from "@/components/shop/ProductCard";
import { getAllProducts, isConciergeProduct } from "@/lib/shop-data";
import { ConciergeEditRails } from "@/components/concierge/ConciergeEditRails";
import heroImg from "@/assets/concierge-hero.jpg";
import editBanner from "@/assets/cat-clothing.jpg";
import catSneakers from "@/assets/p-nike-dunk.png";
import catLuxury from "@/assets/p-aape-jacket.png";
import catWatch from "@/assets/p-watch.png";
import catBag from "@/assets/hero-bag.jpg";

const bottomTabs = [
  { id: "home", label: "HOME", Icon: Home, to: "/" as const },
  { id: "categories", label: "CATEGORIES", Icon: Grid3x3, to: "/concierge-categories" as const, active: true },
  { id: "request", label: "", Icon: Plus, center: true },
  { id: "track", label: "TRACK", Icon: MapPin, to: "/track-request" as const },
  { id: "account", label: "ACCOUNT", Icon: User, to: "/account" as const },
];


const trust = [
  { Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC\nGUARANTEED" },
  { Icon: ShieldCheck, title: "TRUSTED\nSOURCING" },
  { Icon: Truck, title: "SAFE\nDELIVERY" },
  { Icon: Headphones, title: "DEDICATED\nSUPPORT" },
];

const steps = [
  { n: 1, title: "REQUEST" },
  { n: 2, title: "SOURCING" },
  { n: 3, title: "CONFIRMATION" },
  { n: 4, title: "DELIVERY" },
];



const requestCats = [
  { id: "sneakers", label: "SNEAKERS &\nSTREETWEAR", img: catSneakers },
  { id: "luxury", label: "LUXURY\nFASHION", img: catLuxury },
  { id: "watches", label: "WATCHES &\nACCESSORIES", img: catWatch },
  { id: "bags", label: "BAGS &\nLUGGAGE", img: catBag },
];

export function MobileCategories() {
  const navigate = useNavigate();
  const all = getAllProducts();
  const conciergePicks = all.filter(isConciergeProduct);
  const privateSourcing = (conciergePicks.length >= 4 ? conciergePicks : all).slice(0, 8);
  return (
    <MobileShell headerVariant="shop" showTopTabs={false} bottomVariant="product" activeBottom="shop">
      <div className="bg-background pb-4">

      {/* Hero - compact version of the desktop hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp} className="px-3 pt-5">
        <div className="relative rounded-xl overflow-hidden bg-[#f0e8d8]">
          <img
            src={heroImg}
            alt="Luxury concierge items"
            className="absolute inset-y-0 right-0 h-full w-[60%] object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] from-25% via-[#f5efe4]/88 via-45% to-transparent to-65%" />
          <div className="relative grid grid-cols-2 gap-2 items-center">
            <div className="pl-4 py-6">
              <div className="text-[9px] tracking-[0.28em] font-semibold text-ink/80 mb-2">PERSONAL FASHION CONCIERGE</div>
              <h1 className="font-display font-bold text-[22px] leading-[1.02] tracking-tight text-ink">
                OUR FASHION<br />CONCIERGE SERVICE<br />IS DESIGNED FOR YOU.
              </h1>
              <p className="mt-2 text-[10px] text-muted-foreground max-w-[90%] leading-relaxed">
                For customers looking for exclusive, limited, sold-out, or upcoming fashion pieces.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <motion.button whileTap="tap" variants={buttonTap}
                  onClick={() => (window.location.href = "/start-request")}
                  className="bg-ink text-white px-3 py-2 text-[9px] font-semibold tracking-[0.12em] rounded inline-flex items-center gap-1"
                >
                  REQUEST <ArrowRight className="h-3 w-3" />
                </motion.button>
                <motion.button whileTap="tap" variants={buttonTap}
                  onClick={() => goToLabel("How It Works")}
                  className="bg-white/70 backdrop-blur border border-ink/80 text-ink px-3 py-2 text-[9px] font-semibold tracking-[0.12em] rounded"
                >
                  HOW IT WORKS
                </motion.button>
                <motion.button whileTap="tap" variants={buttonTap}
                  onClick={() => goToLabel("Chat")}
                  className="bg-white/70 backdrop-blur border border-ink/80 text-ink px-3 py-2 text-[9px] font-semibold tracking-[0.12em] rounded inline-flex items-center gap-1"
                >
                  <MessageCircle className="h-3 w-3" /> CHAT
                </motion.button>
              </div>
            </div>
            <div className="h-[240px]" />
          </div>
        </div>
      </motion.section>

      {/* Trust badges */}
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
        className="mt-6 mx-3 grid grid-cols-4 gap-2 border-y border-border py-4">
        {trust.map(({ Icon, title }) => (
          <motion.div key={title} variants={staggerItem} className="flex flex-col items-center text-center gap-1.5">
            <Icon className="h-5 w-5" strokeWidth={1.5} />
            <div className="text-[8.5px] font-bold tracking-[0.08em] whitespace-pre-line leading-tight">{title}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Private Sourcing */}
      <section className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[12px] font-bold tracking-[0.18em]">PRIVATE SOURCING</div>
          <Link to="/collection/$slug" params={{ slug: "private-sourcing" }} className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">VIEW ALL</Link>
        </div>
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
          {privateSourcing.map((p) => (
            <div key={p.id} className="snap-start shrink-0 w-[46%]">
              <ProductCard product={p} eyebrow="Private Sourcing" conciergeMode />
            </div>
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <div className="mt-5">
        <PromoBanner
          tag="Explore Brands"
          title={"SOURCED\nFOR YOU"}
          ctaLabel="Explore Brands"
          ctaTo="/concierge-brands"
          secondaryCtaLabel="Start Request"
          secondaryCtaTo="/start-request"
          image={catBag}
        />
      </div>



      {/* What You Can Request */}
      <section className="px-3 mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12px] font-bold tracking-[0.18em]">WHAT YOU CAN REQUEST</div>
          <button onClick={() => navigate({ to: "/concierge-categories" })} className="text-[10px] font-semibold tracking-[0.15em] text-muted-foreground">SEE ALL</button>
        </div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="grid grid-cols-4 gap-2">
          {requestCats.map((c) => (
            <motion.button key={c.id} variants={staggerItem} initial="rest" whileTap="tap"
              onClick={() => navigate({ to: "/concierge-shop/$category", params: { category: c.id } })}
              className="text-left">
              <motion.div variants={cardHover} className="relative aspect-square rounded-lg overflow-hidden bg-[#f2efe9]">
                <motion.img variants={imageZoom} src={c.img} alt={c.label}
                  className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              </motion.div>
              <div className="mt-1.5 text-[9px] font-bold tracking-[0.08em] whitespace-pre-line leading-tight">{c.label}</div>
            </motion.button>
          ))}
        </motion.div>

        <motion.button whileTap="tap" variants={buttonTap}
          onClick={() => navigate({ to: "/concierge-categories" })}
          className="mt-5 w-full border border-ink py-3 text-[10.5px] font-semibold tracking-[0.2em] rounded inline-flex items-center justify-center gap-2">
          BROWSE ALL CATEGORIES <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </section>

      {/* Editorial banner */}
      <div className="mt-5">
        <PromoBanner
          tag="Fashion Concierge Edit"
          title={"THE EDIT.\nCURATED WEEKLY."}
          subtitle="Rare, limited and new season pieces our concierge can source for you."
          ctaLabel="Start Request"
          ctaTo="/start-request"
          secondaryCtaLabel="Browse Edit"
          secondaryCtaTo="/concierge-categories"
          image={editBanner}
        />
      </div>

      <ConciergeEditRails limit={10} />

      </div>
    </MobileShell>
  );
}
