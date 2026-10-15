import { motion } from "framer-motion";
import wordmarkBlack from "@/assets/ASL_wordmark_black.png.asset.json";
import { goToLabel } from "@/lib/nav-resolve";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ShoppingBag, User, ArrowRight, MessageCircle, Gem, ShieldCheck, Truck, Headphones,
  FileText, Search, Tag, CreditCard, Package, ChevronRight,
} from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { fadeInUp, staggerContainer, staggerItem, cardHover, imageZoom, buttonTap } from "@/lib/motion";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ConciergeEditRails } from "@/components/concierge/ConciergeEditRails";
import heroImg from "@/assets/concierge-hero.jpg";
import editBanner from "@/assets/cat-clothing.jpg";
import catFootwear from "@/assets/cat-footwear.jpg";
import catClothing from "@/assets/cat-clothing.jpg";
import catAccessories from "@/assets/cat-accessories.jpg";
import catBag from "@/assets/hero-bag.jpg";
import catFragrances from "@/assets/cat-fragrances.jpg";
import catLimited from "@/assets/cat-limited.jpg";

const nav = [
  { label: "HOME", to: "/" as const },
  { label: "CONCIERGE SERVICE", to: "/concierge-service" as const, active: true },
  { label: "CATEGORIES", to: "/concierge-categories" as const },
  { label: "HOW IT WORKS", to: "/how-it-works" as const },
  { label: "TRACK REQUEST", to: "/track-request" as const },
  { label: "FAQ", to: "/faq" as const },
];


const trust = [
  { Icon: Gem, title: "EXCLUSIVE ACCESS", sub: "Access sold-out, limited\nand hard-to-find items." },
  { Icon: ShieldCheck, title: "TRUSTED SOURCING", sub: "We work with verified\nsuppliers worldwide." },
  { Icon: StrokeRosetteCheckIcon, title: "AUTHENTIC GUARANTEED", sub: "Every item is 100% authentic\nor your money back." },
  { Icon: Truck, title: "SAFE DELIVERY", sub: "Fast and secure delivery\nto your doorstep." },
  { Icon: Headphones, title: "DEDICATED SUPPORT", sub: "Our team is here to assist\nyou every step of the way." },
];

const steps = [
  { n: 1, Icon: FileText, title: "SUBMIT REQUEST", sub: "Fill out the request form with\ndetails of the item you want." },
  { n: 2, Icon: Search, title: "WE SOURCE", sub: "Our team searches trusted\nsuppliers to find your item." },
  { n: 3, Icon: Tag, title: "PRICE CONFIRMATION", sub: "We send you the price and\nestimated delivery time." },
  { n: 4, Icon: CreditCard, title: "SECURE PAYMENT", sub: "Make payment to confirm\nand secure your order." },
  { n: 5, Icon: Package, title: "ORDER & PROCESS", sub: "We order, verify, and prepare\nyour item for shipment." },
  { n: 6, Icon: Truck, title: "DELIVERY", sub: "Your item is delivered safely\nto your doorstep." },
];

const requestCats = [
  { id: "sneakers", img: catFootwear, label: "SNEAKERS &\nSTREETWEAR" },
  { id: "luxury", img: catClothing, label: "LUXURY\nFASHION" },
  { id: "watches", img: catAccessories, label: "WATCHES &\nACCESSORIES" },
  { id: "bags", img: catBag, label: "BAGS &\nLUGGAGE" },
  { id: "fragrance", img: catFragrances, label: "FRAGRANCES &\nBEAUTY" },
  { id: "limited", img: catLimited, label: "LIMITED EDITION\nDROPS" },
  { id: "custom", img: heroImg, label: "CUSTOM\nREQUESTS" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center mb-10">
      <h2 className="font-display font-bold text-[22px] tracking-[0.28em] uppercase">{children}</h2>
      <div className="h-[2px] w-14 bg-ink mt-2" />
    </div>
  );
}

export function DesktopCategories() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-30">
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-6 py-4 gap-6">
          <Link to="/" className="shrink-0">
            <img src={wordmarkBlack.url} alt="ASL ORIGINALS" className="h-[16px] w-auto object-contain" />
            <div className="text-[9px] tracking-[0.3em] text-muted-foreground mt-1">FASHION CONCIERGE</div>
          </Link>
          <nav className="flex items-center gap-9">
            {nav.map((n) => {
              const cls = `text-[11px] font-semibold tracking-[0.15em] transition ${n.active ? "text-ink border-b-2 border-ink pb-5 -mb-[17px]" : "text-muted-foreground hover:text-ink"}`;
              return <Link key={n.label} to={n.to} className={cls}>{n.label}</Link>;
            })}

          </nav>
          <div className="flex items-center gap-5">
            <Link to="/account" aria-label="Account">
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>

            <button onClick={() => goToLabel("Cart")} aria-label="Cart" className="relative">
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 bg-ink text-white text-[9px] font-bold rounded-full h-4 w-4 grid place-items-center">2</span>
            </button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap="tap" variants={buttonTap}
              onClick={() => (window.location.href = "/start-request")}
              className="bg-ink text-white px-5 py-2.5 text-[10.5px] font-semibold tracking-[0.15em] rounded"
            >
              START A REQUEST
            </motion.button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <motion.section initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="mx-auto max-w-[1600px] px-6 pt-8">
          <div className="relative rounded-xl overflow-hidden bg-[#f0e8d8]">
            <img src={heroImg} alt="Luxury concierge items" className="absolute inset-y-0 right-0 h-full w-[62%] object-cover object-left" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f5efe4] from-30% via-[#f5efe4]/80 via-45% to-transparent to-65%" />
            <div className="relative grid grid-cols-2 gap-10 items-center">
              <div className="pl-10 py-14">
                <div className="text-[11px] tracking-[0.3em] font-semibold mb-5">PERSONAL FASHION CONCIERGE</div>
                <h1 className="font-display font-bold text-[56px] leading-[1.02] tracking-tight">
                  OUR FASHION<br />CONCIERGE SERVICE<br />IS DESIGNED FOR YOU.
                </h1>
                <p className="mt-5 text-[13.5px] text-muted-foreground max-w-md leading-relaxed">
                  Our fashion concierge service is designed for customers looking for exclusive, limited, sold-out, or upcoming fashion pieces that may not currently be available in our store.
                </p>
                <div className="flex items-center gap-3 mt-7">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
                    onClick={() => (window.location.href = "/start-request")}
                    className="bg-ink text-white px-5 py-3 text-[11px] font-semibold tracking-[0.15em] rounded inline-flex items-center gap-2"
                  >
                    START A REQUEST <ArrowRight className="h-3.5 w-3.5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
                    onClick={() => goToLabel("How It Works")}
                    className="bg-white/70 backdrop-blur border border-ink/80 text-ink px-5 py-3 text-[11px] font-semibold tracking-[0.15em] rounded"
                  >
                    HOW IT WORKS
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
                    onClick={() => goToLabel("Chat")}
                    className="bg-white/70 backdrop-blur border border-ink/80 text-ink px-5 py-3 text-[11px] font-semibold tracking-[0.15em] rounded inline-flex items-center gap-2"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> CHAT WITH US
                  </motion.button>
                </div>
              </div>
              <div className="h-[440px]" />
            </div>
          </div>

          {/* Trust bar */}
          <div className="mt-8 grid grid-cols-5 gap-6 border-y border-border py-6">
            {trust.map(({ Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3">
                <Icon className="h-6 w-6 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <div className="text-[11px] font-bold tracking-[0.12em]">{title}</div>
                  <div className="text-[11px] text-muted-foreground leading-snug whitespace-pre-line mt-1">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeInUp} className="px-6 py-14">
        <div className="mx-auto max-w-[1600px]">
          <SectionTitle>HOW IT WORKS</SectionTitle>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-2">
            {steps.flatMap((s, i) => {
              const items = [
                <motion.div key={`step-${s.n}`} variants={staggerItem} className="flex flex-col items-center text-center px-2">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full border-2 border-ink grid place-items-center bg-background">
                      <s.Icon className="h-9 w-9" strokeWidth={1.5} />
                    </div>
                    <div className="absolute -top-1 -left-1 h-7 w-7 rounded-full bg-ink text-white text-[12px] font-bold grid place-items-center">{s.n}</div>
                  </div>
                  <div className="mt-4 text-[12px] font-bold tracking-[0.1em]">{s.title}</div>
                  <div className="mt-2 text-[11px] text-muted-foreground leading-snug whitespace-pre-line">{s.sub}</div>
                </motion.div>,
              ];
              if (i < steps.length - 1) {
                items.push(
                  <div key={`sep-${s.n}`} className="pt-10 flex justify-center">
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                );
              }
              return items;
            })}
          </motion.div>
        </div>
      </motion.section>

      <PromoBanner
        tag="Fashion Concierge"
        title={"SOURCED\nFOR YOU"}
        ctaLabel="Start Request"
        ctaTo="/start-request"
        secondaryCtaLabel="How It Works"
        secondaryCtaTo="/how-it-works"
        image={heroImg}
      />



      {/* What You Can Request */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }} variants={fadeInUp} className="px-6 pb-12">
        <div className="mx-auto max-w-[1600px]">
          <SectionTitle>WHAT YOU CAN REQUEST</SectionTitle>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-7 gap-4">
            {requestCats.map(({ id, img, label }) => (
              <motion.button key={label} variants={staggerItem} initial="rest" whileTap="tap"
                onClick={() => id === "custom" ? navigate({ to: "/start-request" }) : navigate({ to: "/concierge-shop/$category", params: { category: id } })}
                className="text-left">
                <motion.div variants={cardHover} className="relative aspect-square rounded-xl overflow-hidden bg-[#f2efe9]">
                  <motion.img variants={imageZoom} src={img} alt={label.replace("\n", " ")}
                    className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                </motion.div>
                <div className="mt-2.5 text-[10.5px] font-bold tracking-[0.1em] whitespace-pre-line leading-tight">{label}</div>
              </motion.button>
            ))}
          </motion.div>

          <div className="mt-8 flex justify-center">
            <motion.button whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}
              onClick={() => navigate({ to: "/concierge-categories" })}
              className="border border-ink px-8 py-3 text-[11px] font-semibold tracking-[0.2em] rounded inline-flex items-center gap-3"
            >
              BROWSE ALL CATEGORIES <ArrowRight className="h-3.5 w-3.5" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      <div className="mt-4">
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
      <div className="pb-16" />
    </div>
  );
}
