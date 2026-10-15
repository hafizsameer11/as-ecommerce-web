import { useState, type ReactNode } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "@tanstack/react-router";
import { Search, User, Heart, ShoppingBag, Facebook, Instagram, Twitter, ChevronDown, Shirt, Footprints, ShoppingBasket, SprayCan, ArrowRight, Menu, X, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { fadeInUp, buttonTap, staggerContainer, staggerItem } from "@/lib/motion";
import { useCartCount } from "@/lib/cart-store";
import { useWishlistCount } from "@/lib/wishlist";
import { useAuth } from "@/lib/auth-store";
import { subCategories } from "@/lib/shop-data";
import { PaymentBrandLogos } from "@/components/checkout/PaymentBrandLogos";
import wordmarkWhite from "@/assets/ASL_wordmark_white.png.asset.json";
import heroModels from "@/assets/hero-models.jpg";
import heroSneakers from "@/assets/hero-sneakers.jpg";
import { StorefrontAnnouncementBar } from "@/components/shell/StorefrontAnnouncementBar";
import { Button } from "@/components/ui/button";


type NavItem =
  | { label: string; to: any; params?: any; sale?: boolean; mega?: false }
  | { label: string; mega: true; sale?: false };

const nav: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "New & Trending", to: "/trending" },
  { label: "Shop", mega: true },
  { label: "Coming Soon", to: "/coming-soon" },
  { label: "Sale", to: "/shop/sales", sale: true },
  { label: "Fashion Concierge", to: "/concierge-service" },
  { label: "Contact", to: "/customer-care/contact-us" },
];

const megaColumns = [
  { title: "Clothing", Icon: Shirt, catId: "clothing" },
  { title: "Footwear", Icon: Footprints, catId: "footwear" },
  { title: "Accessories", Icon: ShoppingBasket, catId: "accessories" },
  { title: "Fragrances", Icon: SprayCan, catId: "fragrances" },
].map((col) => ({
  ...col,
  viewAll: { to: "/shop/$category" as const, params: { category: col.catId } },
  items: (subCategories[col.catId] ?? []).map((label) => ({
    label,
    to: "/shop/$category" as const,
    params: { category: col.catId },
    search: label.toLowerCase().startsWith("all") ? {} : { sub: label },
  })),
}));

export function DesktopShell({
  children,
  active = "Home",
}: {
  children: ReactNode;
  active?: string;
}) {
  const [email, setEmail] = useState("");
  const [shopOpen, setShopOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [drawerShopOpen, setDrawerShopOpen] = useState(false);
  const [drawerCategory, setDrawerCategory] = useState<string | null>(null);
  const cartCount = useCartCount();
  const wishCount = useWishlistCount();
  const { isLoggedIn, openLogin } = useAuth();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";

  const openAppDownload = () => {
    setDrawer(false);
    window.dispatchEvent(new CustomEvent("asl:open-app-offer"));
  };


  return (
    <div className="customer-ui min-h-screen bg-background">
      <StorefrontAnnouncementBar />

      <header
        className="sticky top-0 z-30 bg-ink text-white"
        onMouseLeave={() => setShopOpen(false)}
      >
        <div className="mx-auto max-w-[1600px] flex items-center justify-between px-4 lg:px-6 py-4 gap-4 lg:gap-6">
          <div className="flex items-center gap-4">
            <motion.button
              whileTap="tap"
              variants={buttonTap}
              onClick={() => setDrawer(true)}
              className="lg:hidden text-white"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap="tap" variants={buttonTap}>
              <Link to="/" className="shrink-0 inline-block">
                <img src={wordmarkWhite.url} alt="ASL ORIGINALS" className="h-[19px] w-auto object-contain" />
              </Link>
            </motion.div>
          </div>

          <nav className="hidden lg:flex items-center gap-8 flex-1 justify-center">
            {nav.map((n) => {
              const isActive = n.label === active;
              const base = "text-xs font-semibold tracking-[0.18em] uppercase pb-1 border-b-2 transition flex items-center gap-1";
              if ("mega" in n && n.mega) {
                const cls = `${base} ${isActive || shopOpen ? "border-gold text-white" : "border-transparent text-white/90 hover:text-gold"}`;
                return (
                  <button
                    key={n.label}
                    onClick={() => setShopOpen((v) => !v)}
                    className={cls}
                  >
                    {n.label} <ChevronDown className={`h-3 w-3 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                  </button>
                );
              }
              const cls = n.sale
                ? `${base} text-sale border-transparent hover:opacity-80`
                : isActive
                  ? `${base} border-gold text-white`
                  : `${base} border-transparent text-white/90 hover:text-gold`;
              return (
                <motion.div key={n.label} whileHover={{ y: -1 }} whileTap="tap" variants={buttonTap}>
                  <Link to={n.to} params={n.params} className={cls}>
                    {n.label}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          <div className="flex items-center gap-5 shrink-0 text-white">
            {!isSearchPage && (
              <Link to="/search" aria-label="Search">
                <motion.span whileHover={{ scale: 1.1 }} whileTap="tap" variants={buttonTap} className="inline-block">
                  <Search className="h-5 w-5" />
                </motion.span>
              </Link>
            )}
            {isLoggedIn ? (
              <Link to="/account" aria-label="Account">
                <motion.span whileHover={{ scale: 1.1 }} whileTap="tap" variants={buttonTap} className="inline-block">
                  <User className="h-5 w-5" />
                </motion.span>
              </Link>
            ) : (
              <button aria-label="Sign in" className="text-white" onClick={() => openLogin("signin", "/account")}>
                <motion.span whileHover={{ scale: 1.1 }} whileTap="tap" variants={buttonTap} className="inline-block">
                  <User className="h-5 w-5" />
                </motion.span>
              </button>
            )}
            <Link to="/account/wishlist" aria-label="Wishlist" className="relative">
              <motion.span whileHover={{ scale: 1.1 }} whileTap="tap" variants={buttonTap} className="inline-block">
                <Heart className="h-5 w-5" />
              </motion.span>
              {wishCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Link>
            <Link to="/cart" aria-label="Cart" className="relative">
              <motion.span whileHover={{ scale: 1.1 }} whileTap="tap" variants={buttonTap} className="inline-block">
                <ShoppingBag className="h-5 w-5" />
              </motion.span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-ink">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mega menu */}
        <AnimatePresence>
          {shopOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute left-0 right-0 top-full bg-ink text-white border-t border-white/10 shadow-2xl"
              onMouseEnter={() => setShopOpen(true)}
            >
              <div className="mx-auto max-w-[1600px] grid grid-cols-[1.1fr_repeat(4,1fr)_1fr] gap-8 px-6 py-10">
                {/* Brand tile */}
                <div className="relative rounded-lg overflow-hidden min-h-[340px] bg-neutral-900">
                  <img src={heroModels} alt="ASL ORIGINALS" className="absolute inset-0 h-full w-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                  <div className="absolute top-5 left-5">
                    <div className="font-display font-black text-base tracking-[0.2em] text-white whitespace-nowrap">ASL ORIGINALS</div>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <div className="font-display font-bold text-xl leading-tight tracking-wide text-white">
                      PREMIUM STYLE.<br />ORIGINAL ALWAYS.
                    </div>
                    <Link
                      to="/shop"
                      onClick={() => setShopOpen(false)}
                      className="inline-block mt-4 border border-gold text-gold px-4 py-2 text-[10px] font-semibold tracking-[0.2em] hover:bg-gold hover:text-ink transition"
                    >
                      SHOP NOW
                    </Link>
                  </div>
                </div>

                {megaColumns.map((col) => (
                  <div key={col.title}>
                    <div className="flex items-center gap-2 mb-4">
                      <col.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
                      <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-gold">{col.title}</div>
                    </div>
                    <ul className="space-y-2.5">
                      {col.items.map((it) => (
                        <li key={it.label}>
                          <Link
                            to={it.to}
                            params={it.params}
                            search={it.search}
                            onClick={() => setShopOpen(false)}
                            className="text-[12px] text-white/75 hover:text-gold transition"
                          >
                            {it.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={col.viewAll.to}
                      params={col.viewAll.params}
                      onClick={() => setShopOpen(false)}
                      className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:underline"
                    >
                      View All {col.title} <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}

                {/* New Arrivals panel */}
                <div className="relative rounded-lg overflow-hidden min-h-[340px] bg-neutral-800">
                  <img src={heroSneakers} alt="New Arrivals" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                  <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/40 to-ink/80" />
                  <div className="relative p-5 flex flex-col h-full">
                    <div className="font-display font-bold text-base tracking-[0.2em] text-white">NEW ARRIVALS</div>
                    <p className="mt-2 text-[11px] text-white/70 leading-relaxed">
                      Discover the latest drops from top brands.
                    </p>
                    <div className="mt-auto">
                      <Link
                        to="/trending"
                        onClick={() => setShopOpen(false)}
                        className="inline-block border border-gold text-gold px-4 py-2 text-[10px] font-semibold tracking-[0.2em] hover:bg-gold hover:text-ink transition"
                      >
                        SHOP NOW
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Tablet drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDrawer(false);
                setDrawerShopOpen(false);
              }}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[80%] max-w-sm bg-background flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-ink text-white">
                <div className="font-display font-bold text-lg tracking-widest">Menu</div>
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => setDrawer(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto py-2 no-scrollbar"
              >
                {nav.map((n) => {
                  if ("mega" in n && n.mega) {
                    return (
                      <div key={n.label} className="border-b border-border">
                        <button
                          type="button"
                          onClick={() => setDrawerShopOpen((open) => !open)}
                          aria-expanded={drawerShopOpen}
                          className="flex w-full items-center justify-between px-5 py-3.5 text-[12px] font-semibold tracking-[0.15em] uppercase text-foreground"
                        >
                          Shop
                          <ChevronDown className={`h-4 w-4 transition-transform ${drawerShopOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {drawerShopOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              {megaColumns.map((col) => {
                                const catOpen = drawerCategory === col.title;
                                return (
                                  <div key={col.title} className="border-t border-border/70">
                                    <button
                                      type="button"
                                      aria-expanded={catOpen}
                                      onClick={() => setDrawerCategory(catOpen ? null : col.title)}
                                      className="flex w-full items-center justify-between px-5 py-3 pl-8"
                                    >
                                      <span className="flex items-center gap-2">
                                        <col.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
                                        <span className="text-[11px] font-bold tracking-[0.15em] uppercase">{col.title}</span>
                                      </span>
                                      <ChevronDown className={`h-4 w-4 transition-transform ${catOpen ? "rotate-180" : ""}`} />
                                    </button>
                                    <AnimatePresence initial={false}>
                                      {catOpen && (
                                        <motion.ul
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="overflow-hidden space-y-1.5 pl-14 pr-5 pb-3"
                                        >
                                          {col.items.map((it) => (
                                            <li key={it.label}>
                                              <Link
                                                to={it.to}
                                                params={it.params}
                                                search={it.search}
                                                onClick={() => {
                                                  setDrawer(false);
                                                  setDrawerShopOpen(false);
                                                  setDrawerCategory(null);
                                                }}
                                                className="text-[12px] text-muted-foreground hover:text-ink transition"
                                              >
                                                {it.label}
                                              </Link>
                                            </li>
                                          ))}
                                        </motion.ul>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }
                  return (
                    <motion.div key={n.label} variants={staggerItem}>
                      <Link
                        to={n.to}
                        params={n.params}
                        onClick={() => setDrawer(false)}
                        className={`block px-5 py-3.5 text-[12px] font-semibold tracking-[0.15em] uppercase border-b border-border ${n.sale ? "text-sale" : "text-foreground hover:bg-muted"}`}
                      >
                        {n.label}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="mt-3 border-t border-border bg-muted/40 px-5 py-6 text-center">
                  <p className="text-[13px] font-semibold text-foreground">Download our app</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      onClick={openAppDownload}
                      className="h-12 rounded-md bg-ink px-3 text-paper hover:bg-ink/90"
                    >
                      <span className="text-left leading-tight">
                        <span className="block text-[8px] font-medium">Download on the</span>
                        <span className="block text-[12px] font-bold">App Store</span>
                      </span>
                    </Button>
                    <Button
                      type="button"
                      onClick={openAppDownload}
                      className="h-12 rounded-md bg-ink px-3 text-paper hover:bg-ink/90"
                    >
                      <Smartphone className="h-4 w-4" />
                      <span className="text-left leading-tight">
                        <span className="block text-[8px] font-medium">Get it on</span>
                        <span className="block text-[12px] font-bold">Google Play</span>
                      </span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {children}

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={fadeInUp}
        className="px-6 py-10 border-t border-border"
      >
        <div className="mx-auto max-w-[1600px] flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-display font-bold tracking-widest uppercase">
              Download the ASL ORIGINALS App
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Shop new arrivals, exclusive drops and enjoy a seamless shopping experience on the go.
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button whileHover={{ y: -2 }} whileTap="tap" variants={buttonTap} onClick={() => toast("Coming soon")} className="bg-ink text-white px-5 py-3 text-xs uppercase tracking-widest">
              ▶ Google Play
            </motion.button>
            <motion.button whileHover={{ y: -2 }} whileTap="tap" variants={buttonTap} onClick={() => toast("Coming soon")} className="bg-ink text-white px-5 py-3 text-xs uppercase tracking-widest">
               App Store
            </motion.button>
          </div>
        </div>
      </motion.section>

      <footer className="bg-ink text-paper">
        <div className="mx-auto max-w-[1600px] px-10 pt-12 pb-8">
          {/* Newsletter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-10 border-b border-paper/10">
            <div>
              <h2 className="font-display italic tracking-tight text-3xl md:text-4xl mb-4">Join the Collective</h2>
              <p className="text-paper/60 max-w-sm leading-[2] uppercase text-[10px] tracking-[0.2em]">
                Subscribe for early access to seasonal drops and exclusive editorial content.
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  toast("Subscribed " + email);
                  setEmail("");
                }}
                className="relative w-full"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-transparent border-b border-paper/30 py-4 pr-28 text-xs tracking-widest uppercase text-paper outline-none focus:border-gold transition-colors placeholder:text-paper/25"
                />
                <button
                  type="submit"
                  className="absolute right-0 bottom-4 text-gold text-[10px] font-bold tracking-widest hover:text-paper transition-colors"
                >
                  SUBSCRIBE - </button>
              </form>
              <p className="mt-4 text-[10px] leading-[1.9] text-paper/40">
                By subscribing, you agree to receive updates, exclusive offers, and promotional messages from ASL ORIGINALS. You can unsubscribe at any time. Please read our{" "}
                <Link to="/customer-care/privacy-policy" className="underline underline-offset-2 hover:text-gold transition-colors">
                  Privacy Policy
                </Link>{" "}
                for more information.
              </p>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-10">
            <div className="md:col-span-4">
              <div className="mb-8">
                <img
                  src={wordmarkWhite.url}
                  alt="ASL ORIGINALS"
                  className="mb-4 h-[18px] w-auto max-w-[210px] object-contain"
                />
                <p className="text-paper/50 text-xs leading-relaxed max-w-xs">
                  Your trusted destination for authentic luxury streetwear &amp; lifestyle essentials. Defined by heritage, refined for the modern world.
                </p>
              </div>
              <div className="flex gap-6">
                {[
                  { label: "Instagram", Icon: Instagram },
                  { label: "Facebook", Icon: Facebook },
                  { label: "Twitter", Icon: Twitter },
                ].map(({ label, Icon }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.15 }}
                    whileTap="tap"
                    variants={buttonTap}
                    aria-label={label}
                    onClick={() => goToLabel(label)}
                    className="text-paper/70 hover:text-gold transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>

            {[
              { title: "Information", span: "md:col-span-2", items: ["About Us", "Terms of Service", "Privacy Policy", "Cookie Policy", "FAQs"] },
              { title: "Customer Service", span: "md:col-span-3 md:pl-8", items: ["Refund Policy", "Shipping Policy", "Contact Details", "Chat with Us"] },
            ].map((col) => (
              <div key={col.title} className={col.span}>
                <div className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-8">{col.title}</div>
                <ul className="space-y-4 text-xs font-light">
                  {col.items.map((it) => (
                    <li key={it}>
                      <button onClick={() => goToLabel(it)} className="text-paper/80 hover:text-gold transition-colors text-left">
                        {it}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="md:col-span-3">
              <div className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase mb-8">Contact Details</div>
              <div className="space-y-4 text-xs font-light">
                <a href="mailto:customerservice@asloriginals.com" className="block text-paper/80 hover:text-gold transition-colors">customerservice@asloriginals.com</a>
                <a href="tel:+2348001234567" className="block text-paper/80 hover:text-gold transition-colors">+234 800 123 4567</a>
                <p className="text-paper/60 leading-relaxed italic font-display">
                  Lekki Phase 1,<br />Lagos, Nigeria
                </p>
                <p className="text-[10px] tracking-tight text-paper/40">Mon - Sat: 9AM - 9PM</p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-10 border-t border-paper/10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">
              © 2026 ASL ORIGINALS. All rights reserved.
            </div>
            <PaymentBrandLogos className="opacity-60 hover:opacity-100 transition-opacity" />
            <div className="text-[9px] uppercase tracking-[0.2em] text-paper/40">Crafted for the Discerning</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
