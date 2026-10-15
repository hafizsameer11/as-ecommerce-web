import { useState, type ReactNode } from "react";
import { goToLabel } from "@/lib/nav-resolve";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation, useRouter } from "@tanstack/react-router";
import {
  Bell, Home, TrendingUp, ShoppingBag, Tag, Scissors, Phone, Clock,
  Search, Heart, User, Settings, X, Info, MessageCircle, HelpCircle, FileText,
  Shield, Cookie, RefreshCw, Truck, Share2, UserPlus, Smartphone, ChevronRight, ArrowLeft,
  Grid3x3, Plus, MapPin, MoreHorizontal, Menu,
  ChevronDown, Crown, Instagram, Facebook, Twitter, Youtube, Linkedin, Music2,

} from "lucide-react";
import { toast } from "sonner";
import { WhatsAppFab } from "@/components/home/WhatsAppFab";
import { staggerContainer, staggerItem, buttonTap } from "@/lib/motion";
import { sideNavSections, type MenuItem } from "@/components/account/accountData";
import { useCartCount } from "@/lib/cart-store";
import { useWishlistCount } from "@/lib/wishlist";
import { useAccountDisplayName, useAuth } from "@/lib/auth-store";
import { useClubRewards } from "@/components/account/rewardsData";
import { subCategories } from "@/lib/shop-data";
import wordmarkBlack from "@/assets/ASL_wordmark_black.png.asset.json";
import wordmarkWhite from "@/assets/ASL_wordmark_white.png.asset.json";
import emblemWhite from "@/assets/ASL_emblem_white_transparent.png.asset.json";
import { StorefrontAnnouncementBar } from "@/components/shell/StorefrontAnnouncementBar";


const topTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" },
  { id: "new", label: "New & Trending", Icon: TrendingUp },
  { id: "shop", label: "Shop", Icon: ShoppingBag, to: "/shop" },
  { id: "coming-soon", label: "Coming Soon", Icon: Clock, to: "/coming-soon" },
  { id: "sale", label: "Sale", Icon: Tag, sale: true },
  { id: "concierge", label: "Fashion Concierge", Icon: Scissors, to: "/concierge-service" },
  { id: "contact", label: "Contact", Icon: Phone },
];

const bottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const, sale: false },
  { id: "new", label: "New & Trending", Icon: TrendingUp, to: "/trending" as const, sale: false },
  { id: "shop", label: "Shop", Icon: ShoppingBag, to: "/shop" as const, sale: false },
  { id: "sale", label: "Sale", Icon: Tag, to: "/shop/sales" as const, sale: true },
  { id: "concierge", label: "Fashion Concierge", Icon: Scissors, to: "/concierge-service" as const, sale: false },
  { id: "contact", label: "Contact", Icon: Phone, to: "/customer-care/contact-us" as const, sale: false },
];

const productBottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const },
  { id: "shop", label: "Shop", Icon: ShoppingBag, to: "/shop" as const },
  { id: "search", label: "Search", Icon: Search, to: "/search" as const },
  { id: "wishlist", label: "Wishlist", Icon: Heart, to: "/account/wishlist" as const },
  { id: "account", label: "Account", Icon: User, to: "/account" as const },
];


const conciergeBottomTabs = [
  { id: "home", label: "Home", Icon: Home, to: "/" as const, center: false },
  { id: "categories", label: "Categories", Icon: Grid3x3, to: "/concierge-categories" as const, center: false },
  { id: "request", label: "Request", Icon: Plus, to: "/start-request" as const, center: true },
  { id: "track", label: "Track", Icon: MapPin, to: "/track-request" as const, center: false },
  { id: "account", label: "Account", Icon: User, to: "/account" as const, center: false },
];


const socialLinks = [
  { label: "Instagram", handle: "@asloriginals", Icon: Instagram, href: "https://instagram.com/asloriginals" },
  { label: "TikTok", handle: "@asloriginals", Icon: Music2, href: "https://tiktok.com/@asloriginals" },
  { label: "Facebook", handle: "ASL ORIGINALS", Icon: Facebook, href: "https://facebook.com/asloriginals" },
  { label: "X (Twitter)", handle: "@asloriginals", Icon: Twitter, href: "https://x.com/asloriginals" },
  { label: "YouTube", handle: "ASL ORIGINALS", Icon: Youtube, href: "https://youtube.com/@asloriginals" },
  { label: "LinkedIn", handle: "ASL ORIGINALS", Icon: Linkedin, href: "https://linkedin.com/company/asloriginals" },
  { label: "WhatsApp", handle: "Chat with us", Icon: MessageCircle, href: "https://wa.me/2348000000000" },
];

const primaryMenu = [
  { id: "home", label: "Home", Icon: Home, to: "/", sale: false },
  { id: "new", label: "New & Trending", Icon: TrendingUp, to: "/trending", sale: false },
  { id: "shop", label: "Shop", Icon: ShoppingBag, to: "/shop", sale: false },
  { id: "coming-soon", label: "Coming Soon", Icon: Clock, to: "/coming-soon", sale: false },
  { id: "sale", label: "Sale", Icon: Tag, to: "/shop/sales", sale: true },
  { id: "concierge", label: "Fashion Concierge", Icon: Scissors, to: "/concierge-service", sale: false },
  { id: "track", label: "Track Your Order", Icon: MapPin, to: "/account/track", sale: false },
  { id: "contact", label: "Contact", Icon: Phone, to: "/customer-care/contact-us", sale: false },
];

const shopCategories: { label: string; to: any; catId?: string }[] = [
  { label: "All Products", to: { to: "/shop" } },
  { label: "Clothing", to: { to: "/shop/$category", params: { category: "clothing" } }, catId: "clothing" },
  { label: "Footwear", to: { to: "/shop/$category", params: { category: "footwear" } } },
  { label: "Accessories", to: { to: "/shop/$category", params: { category: "accessories" } } },
  { label: "Fragrances", to: { to: "/shop/$category", params: { category: "fragrances" } }, catId: "fragrances" },
  { label: "Brands", to: { to: "/brands" } },
  { label: "New Arrivals", to: { to: "/new-arrivals" } },
  { label: "Best Sellers", to: { to: "/best-sellers" } },
];

const drawerLinks = [

  { label: "Coming Soon", Icon: Clock },
  { label: "About Us", Icon: Info },
  { label: "Contact Details", Icon: Phone },
  { label: "Chat with Us (WhatsApp)", Icon: MessageCircle },
  { label: "FAQs", Icon: HelpCircle },
  { label: "Terms of Service", Icon: FileText },
  { label: "Privacy Policy", Icon: Shield },
  { label: "Cookie Policy", Icon: Cookie },
  { label: "Refund Policy", Icon: RefreshCw },
  { label: "Shipping Policy", Icon: Truck },
  { label: "Follow Us", Icon: Share2 },
  { label: "Invite Friends", Icon: UserPlus },
  { label: "App Version", Icon: Smartphone, meta: "1.0.0" },
];

export function MobileShell({
  children,
  activeTop = "home",
  activeBottom = "home",
  headerVariant = "default",
  showTopTabs = true,
  onBack,
  showCartBadge = 2,
  title = "SHOP",
  showSearchInHeader = false,
  bottomVariant = "product",
  leftIcon = "back",
}: {
  children: ReactNode;
  activeTop?: string;
  activeBottom?: string;
  headerVariant?: "default" | "shop" | "category" | "account" | "help";
  showTopTabs?: boolean;
  onBack?: () => void;
  showCartBadge?: number;
  title?: string;
  showSearchInHeader?: boolean;
  bottomVariant?: "default" | "product" | "concierge";
  leftIcon?: "back" | "menu";
}) {

  const [drawer, setDrawer] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [subOpen, setSubOpen] = useState<string[]>([]);

  const [followOpen, setFollowOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const isSearchPage = location.pathname === "/search";
  const cartCountLive = useCartCount();
  const wishCountLive = useWishlistCount();
  const accountDisplayName = useAccountDisplayName();
  const clubTier = useClubRewards((s) => s.summary.tier);

  const cartBadge = cartCountLive > 0 ? cartCountLive : showCartBadge;


  return (
    <div className="customer-ui relative min-h-screen bg-background pb-16">
      <StorefrontAnnouncementBar />
      {/* Top header */}
      <div className={`sticky top-0 z-30 ${
        headerVariant === "shop" || headerVariant === "category"
          ? "bg-background text-foreground border-b border-border"
          : "bg-ink text-paper"
      }`}>
        {headerVariant === "shop" ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-3.5">
            {leftIcon === "menu" ? (
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => setDrawer(true)} aria-label="Menu" className="text-foreground -ml-1">
                <Menu className="h-6 w-6" strokeWidth={1.75} />
              </motion.button>
            ) : (
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => onBack ? onBack() : router.history.back()} aria-label="Back" className="text-foreground">
                <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
              </motion.button>
            )}
            <div className="flex justify-center">
              <img src={wordmarkBlack.url} alt="ASL ORIGINALS" className="h-[14px] w-auto object-contain" />
            </div>
            <div className="flex items-center gap-4 text-foreground">
              {!isSearchPage && (
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => navigate({ to: "/search" })} aria-label="Search">
                  <Search className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </motion.button>
              )}
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => navigate({ to: "/account/wishlist" })} aria-label="Wishlist" className="relative">
                <Heart className="h-[22px] w-[22px]" strokeWidth={1.75} />
                {wishCountLive > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-white text-[9px] font-bold">
                    {wishCountLive}
                  </span>
                )}
              </motion.button>
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => navigate({ to: "/cart" })} aria-label="Bag" className="relative">
                <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />
                {cartBadge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-white text-[9px] font-bold">
                    {cartBadge}
                  </span>
                )}
              </motion.button>
            </div>
          </div>
        ) : headerVariant === "category" ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-3.5">
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => onBack ? onBack() : router.history.back()} aria-label="Back" className="text-foreground">
              <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
            </motion.button>
            <div className="flex justify-center">
              <img src={wordmarkBlack.url} alt="ASL ORIGINALS" className="h-[14px] w-auto object-contain" />
            </div>
            <div className="flex items-center gap-4 text-foreground">
              {showSearchInHeader && !isSearchPage && (
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => navigate({ to: "/search" })} aria-label="Search">
                  <Search className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </motion.button>
              )}
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => navigate({ to: "/cart" })} aria-label="Cart" className="relative text-foreground">
                <ShoppingBag className="h-[22px] w-[22px]" strokeWidth={1.75} />
                {cartBadge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-ink text-white text-[9px] font-bold">
                    {cartBadge}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

        ) : headerVariant === "account" ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-3.5 bg-background text-foreground border-b border-border">
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => setAccountMenuOpen(true)} aria-label="Account menu" className="text-foreground -ml-1">
              <Menu className="h-6 w-6" strokeWidth={1.75} />
            </motion.button>
            <div className="flex justify-center">
              <img src={wordmarkBlack.url} alt="ASL ORIGINALS" className="h-[14px] w-auto object-contain" />
            </div>
            <div className="flex items-center justify-end gap-4 text-foreground">
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => toast("No new notifications")} aria-label="Notifications" className="relative">
                <Bell className="h-6 w-6" strokeWidth={1.75} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sale text-white text-[9px] font-bold grid place-items-center">
                  0
                </span>
              </motion.button>
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => goToLabel("Settings")} aria-label="Settings">
                <Settings className="h-6 w-6" strokeWidth={1.75} />
              </motion.button>
            </div>
          </div>


        ) : headerVariant === "help" ? (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-3.5 bg-background text-foreground border-b border-border">
            <motion.button whileTap="tap" variants={buttonTap} onClick={() => onBack ? onBack() : router.history.back()} aria-label="Back" className="text-foreground">
              <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
            </motion.button>
            <div className="text-center font-display font-black text-base tracking-wide text-foreground">
              {title}
            </div>
            <div className="flex items-center justify-end text-foreground">
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => toast("No new notifications")} aria-label="Notifications" className="relative">
                <Bell className="h-6 w-6" strokeWidth={1.75} />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sale text-white text-[9px] font-bold grid place-items-center">
                  0
                </span>
              </motion.button>
            </div>
          </div>

        ) : (
          <div className="grid grid-cols-[auto_1fr_auto] items-center px-2 py-3">
            {onBack ? (
              <motion.button whileTap="tap" variants={buttonTap} onClick={onBack} aria-label="Back" className="text-paper">
                <ArrowLeft className="h-6 w-6" strokeWidth={1.75} />
              </motion.button>
            ) : (
              <motion.button whileTap="tap" variants={buttonTap} onClick={() => setDrawer(true)} aria-label="Menu" className="text-paper">
                <Menu className="h-6 w-6" strokeWidth={1.75} />
              </motion.button>
            )}
            <div className="flex justify-center">
              <img src={wordmarkWhite.url} alt="ASL ORIGINALS" className="h-[14px] w-auto object-contain" />
            </div>
            <div className="flex items-center gap-3 text-paper">
              <motion.button
                whileTap="tap"
                variants={buttonTap}
                onClick={() => navigate({ to: "/account/wishlist" })}
                aria-label="Wishlist"
                className="relative"
              >
                <Heart className="h-6 w-6" strokeWidth={1.75} />
                {wishCountLive > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gold text-white text-[9px] font-bold grid place-items-center">
                    {wishCountLive}
                  </span>
                )}
              </motion.button>
              <motion.button
                whileTap="tap"
                variants={buttonTap}
                onClick={() => navigate({ to: "/cart" })}
                aria-label="Cart"
                className="relative"
              >
                <ShoppingBag className="h-6 w-6" strokeWidth={1.75} />
                {cartBadge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-bold text-paper"
                  >
                    {cartBadge}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>


      {/* Icon tab strip - white background (hidden on mobile, preserved for later) */}
      {showTopTabs && location.pathname === "/" && (
        <div className="sticky top-0 z-20 bg-white hidden md:block">
          <div className="flex items-start justify-between px-0 pb-1 pt-2.5">
            {topTabs.map(({ id, label, Icon, sale, to }) => {
              const active = activeTop === id;
              const onClick = () => {
                if (to) navigate({ to });
                else goToLabel(label);
              };
              const color = sale ? "text-sale" : active ? "text-gold" : "text-foreground";
              return (
                <motion.button
                  key={id}
                  whileTap="tap"
                  variants={buttonTap}
                  onClick={onClick}
                  className="flex-1 flex flex-col items-center gap-1 px-0.5 py-1"
                >
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon
                      className={`h-6 w-6 ${color}`}
                      strokeWidth={1.6}
                      fill={active && !sale ? "currentColor" : "none"}
                    />
                  </motion.div>
                  <span
                    className={`text-[7px] font-semibold uppercase tracking-wide text-center whitespace-nowrap ${color}`}
                  >
                    {label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {children}

      <WhatsAppFab />

      {/* Bottom tab bar */}
      <div className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background">
        {bottomVariant === "concierge" ? (
          <div className="grid grid-cols-5 items-end px-2 pt-2 pb-2">
            {conciergeBottomTabs.map(({ id, label, Icon, to, center }) => {
              const active = activeBottom === id;
              const inner = center ? (
                <div className="flex flex-col items-center gap-1">
                  <div className="h-11 w-11 rounded-full grid place-items-center -mt-5 shadow-md bg-gold">
                    <Icon className="h-5 w-5 text-ink" strokeWidth={2.25} />
                  </div>
                  <span className="text-[9px] font-semibold text-ink">{label}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Icon className={`h-[20px] w-[20px] ${active ? "text-ink" : "text-ink/70"}`} strokeWidth={1.75} />
                  <span className={`text-[9px] ${active ? "text-ink font-semibold" : "text-ink/70"}`}>{label}</span>
                </div>
              );
              return (
                <motion.div key={id} whileTap="tap" variants={buttonTap} className="flex justify-center">
                  <Link to={to} className="flex justify-center w-full">{inner}</Link>
                </motion.div>
              );
            })}
          </div>
        ) : bottomVariant === "product" ? (
          <div className="grid grid-cols-5">
            {productBottomTabs.map(({ id, label, Icon, to }) => {
              const active = activeBottom === id;
              const color = active ? "text-ink" : "text-muted-foreground";
              const badge = id === "wishlist" ? (wishCountLive || undefined) : undefined;
              return (
                <motion.div key={id} whileTap="tap" variants={buttonTap} className="flex justify-center">
                  <Link to={to} className="flex flex-col items-center gap-1 py-2.5 px-1 relative w-full">
                    <div className="relative">
                      <Icon
                        className={`h-5 w-5 ${color}`}
                        strokeWidth={1.75}
                        fill={active && id !== "search" ? "currentColor" : "none"}
                      />
                      {badge && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-ink text-white text-[9px] font-bold grid place-items-center">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium ${color}`}>{label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-6">
            {bottomTabs.map(({ id, label, Icon, to, sale }) => {
              const active = activeBottom === id;
              const color = sale ? "text-sale" : active ? "text-gold" : "text-muted-foreground";
              const badge = id === "shop" ? (cartBadge || undefined) : undefined;
              return (
                <motion.div key={id} whileTap="tap" variants={buttonTap} className="flex justify-center">
                  <Link
                    to={to}
                    className="flex flex-col items-center gap-0.5 py-2 px-0.5 relative w-full"
                  >
                    <div className="relative">
                      <Icon
                        className={`h-5 w-5 ${color}`}
                        strokeWidth={1.6}
                        fill={active && !sale ? "currentColor" : "none"}
                      />
                      {badge && (
                        <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-ink text-white text-[9px] font-bold grid place-items-center">
                          {badge}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[8px] font-semibold uppercase tracking-wide text-center leading-tight ${color}`}
                    >
                      {label}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>



      {/* Primary drawer (dark) */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setDrawer(false); setMoreOpen(false); }}
              className="fixed inset-0 z-40 bg-black/60"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[86%] max-w-sm bg-ink text-paper flex flex-col overflow-hidden"
            >
              <div className="flex min-h-16 items-center justify-between border-b border-paper/10 px-5 py-3 shrink-0">
                <div className="flex min-w-0 items-center gap-2" aria-label="ASL ORIGINALS">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-[0.5px] border-paper/50 bg-ink">
                    <img
                      src={emblemWhite.url}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <img
                    src={wordmarkWhite.url}
                    alt="ASL ORIGINALS"
                    className="h-[15px] w-auto max-w-[155px] object-contain object-left"
                  />
                </div>
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => { setDrawer(false); setMoreOpen(false); }} aria-label="Close" className="text-paper/80">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="relative flex-1 overflow-hidden">
                {/* Primary panel */}
                <motion.div
                  animate={{ x: moreOpen ? "-100%" : "0%" }}
                  transition={{ type: "tween", duration: 0.28 }}
                  className="absolute inset-0 overflow-y-auto no-scrollbar py-2"
                >
                  {primaryMenu.map((n) => (
                    n.id === "shop" ? (
                      <div key={n.id}>
                        <button
                          onClick={() => setShopOpen((v) => !v)}
                          aria-expanded={shopOpen}
                          className="w-full flex items-center gap-3.5 px-5 py-4 text-left active:bg-white/5"
                        >
                          <n.Icon className="h-5 w-5 text-gold shrink-0" strokeWidth={1.6} />
                          <span className="flex-1 text-[13px] font-semibold uppercase tracking-[0.14em]">{n.label}</span>
                          <ChevronDown className={`h-4 w-4 text-paper/50 transition-transform ${shopOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence initial={false}>
                          {shopOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.22 }}
                              className="overflow-hidden bg-white/5"
                            >
                              {shopCategories.map((c) => {
                                const subs = c.catId ? (subCategories[c.catId] ?? []).filter((s) => !s.toLowerCase().startsWith("all")) : [];
                                const subIsOpen = c.catId ? subOpen.includes(c.catId) : false;
                                return (
                                  <div key={c.label}>
                                    <div className="w-full flex items-center pl-14 pr-2 active:bg-white/10">
                                      <button
                                        onClick={() => { setDrawer(false); navigate(c.to as any); }}
                                        className="flex-1 py-3 text-left"
                                      >
                                        <span className="text-[12.5px] text-paper/85">{c.label}</span>
                                      </button>
                                      {subs.length > 0 ? (
                                        <button
                                          onClick={() => setSubOpen((o) => o.includes(c.catId!) ? o.filter((x) => x !== c.catId) : [...o, c.catId!])}
                                          aria-label={`Toggle ${c.label}`}
                                          className="p-3"
                                        >
                                          <ChevronDown className={`h-4 w-4 text-paper/50 transition-transform ${subIsOpen ? "rotate-180" : ""}`} />
                                        </button>
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-paper/35 mr-3" />
                                      )}
                                    </div>
                                    <AnimatePresence initial={false}>
                                      {subIsOpen && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="overflow-hidden bg-white/5"
                                        >
                                          {subs.map((sub) => (
                                            <button
                                              key={sub}
                                              onClick={() => { setDrawer(false); navigate({ to: "/shop/$category", params: { category: c.catId! }, search: { sub } } as any); }}
                                              className="w-full pl-[72px] pr-5 py-2.5 text-left active:bg-white/10"
                                            >
                                              <span className="text-[12px] text-paper/70">{sub}</span>
                                            </button>
                                          ))}
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <button
                        key={n.id}
                        onClick={() => { setDrawer(false); navigate({ to: n.to } as any); }}
                        className="w-full flex items-center gap-3.5 px-5 py-4 text-left active:bg-white/5"
                      >
                        <n.Icon className={`h-5 w-5 shrink-0 ${n.sale ? "text-sale" : "text-gold"}`} strokeWidth={1.6} />
                        <span className={`flex-1 text-[13px] font-semibold uppercase tracking-[0.14em] ${n.sale ? "text-sale" : ""}`}>{n.label}</span>
                        <ChevronRight className="h-4 w-4 text-paper/35" />
                      </button>
                    )
                  ))}

                  <div className="my-2 mx-5 border-t border-white/10" />

                  <button
                    onClick={() => setMoreOpen(true)}
                    className="w-full flex items-center gap-3.5 px-5 py-4 text-left active:bg-white/5"
                  >
                    <MoreHorizontal className="h-5 w-5 text-gold shrink-0" strokeWidth={1.6} />
                    <span className="flex-1 text-[13px] font-semibold uppercase tracking-[0.14em]">More</span>
                    <ChevronRight className="h-4 w-4 text-paper/35" />
                  </button>

                  <div className="px-5 pt-5 pb-8 text-[10px] tracking-[0.2em] uppercase text-paper/35">
                    Version 1.0.0
                  </div>
                </motion.div>

                {/* More panel */}
                <motion.div
                  animate={{ x: moreOpen ? "0%" : "100%" }}
                  transition={{ type: "tween", duration: 0.28 }}
                  className="absolute inset-0 bg-ink overflow-y-auto no-scrollbar"
                >
                  <button
                    onClick={() => setMoreOpen(false)}
                    className="w-full flex items-center gap-2 px-5 py-3.5 border-b border-white/10 text-left"
                  >
                    <ArrowLeft className="h-4 w-4 text-paper/70" />
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-paper/80">More</span>
                  </button>
                  <div className="py-2">
                    {drawerLinks.map(({ label, Icon, meta }) => (
                      label === "Follow Us" ? (
                        <div key={label}>
                          <button
                            onClick={() => setFollowOpen((v) => !v)}
                            aria-expanded={followOpen}
                            className="w-full flex items-center gap-3 px-5 py-3.5 text-left active:bg-white/5"
                          >
                            <Icon className="h-5 w-5 text-paper/60" strokeWidth={1.5} />
                            <span className="flex-1 text-[13px]">{label}</span>
                            <ChevronDown className={`h-4 w-4 text-paper/40 transition-transform ${followOpen ? "rotate-180" : ""}`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {followOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.22 }}
                                className="overflow-hidden bg-white/5"
                              >
                                {socialLinks.map((s) => (
                                  <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setDrawer(false)}
                                    className="flex items-center gap-3 pl-12 pr-5 py-3 active:bg-white/10"
                                  >
                                    <s.Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
                                    <span className="flex-1 text-[13px] font-medium">{s.label}</span>
                                    <span className="text-[11px] text-paper/45">{s.handle}</span>
                                  </a>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <button
                          key={label}
                          onClick={() => { goToLabel(label); setDrawer(false); setMoreOpen(false); }}
                          className="w-full flex items-center gap-3 px-5 py-3.5 text-left active:bg-white/5"
                        >
                          <Icon className="h-5 w-5 text-paper/60" strokeWidth={1.5} />
                          <span className="flex-1 text-[13px]">{label}</span>
                          {meta ? (
                            <span className="text-xs text-paper/45">{meta}</span>
                          ) : (
                            <ChevronRight className="h-4 w-4 text-paper/35" />
                          )}
                        </button>
                      )
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>


      {/* Account menu drawer */}
      <AnimatePresence>
        {accountMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAccountMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[88%] max-w-sm bg-background flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-background">
                <div className="font-display font-bold text-lg tracking-widest">My Account</div>
                <motion.button whileTap="tap" variants={buttonTap} onClick={() => setAccountMenuOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Profile mini card */}
                <div className="mx-4 mt-4 rounded-2xl bg-ink text-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-white/10 border border-white/15 grid place-items-center shrink-0">
                      <div className="text-center">
                        <div className="font-display font-bold text-[11px] tracking-widest leading-none">ASL</div>
                        <div className="text-[5px] tracking-[0.3em] text-white/70 mt-0.5">ORIGINALS</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-display font-bold text-base leading-tight truncate">{accountDisplayName}</div>
                      <div className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded">
                        <Crown className="h-3 w-3" /> {clubTier} Member
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/60 shrink-0" />
                  </div>
                </div>

                {/* Navigation sections */}
                <div className="px-4 py-4 space-y-5">
                  {sideNavSections.map((section) => (
                    <div key={section.id}>
                      {section.label && (
                        <div className="flex items-center gap-2 mb-2">
                          {section.Icon && <section.Icon className="h-3.5 w-3.5 text-gold" strokeWidth={2} />}
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {section.label}
                          </span>
                        </div>
                      )}
                      <div className="rounded-2xl border border-border bg-white overflow-hidden">
                        {section.items.map((item) => (
                          <AccountMenuRow
                            key={item.id}
                            item={item}
                            onNavigate={() => setAccountMenuOpen(false)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountMenuRow({ item, onNavigate }: { item: MenuItem; onNavigate: () => void }) {
  const navigate = useNavigate();
  const signOut = useAuth((s) => s.signOut);
  const openLogin = useAuth((s) => s.openLogin);
  const isLogout = item.id === "logout";
  const Cmp: any = item.to && !isLogout ? Link : "button";
  const props: any = isLogout
    ? {
        onClick: () => {
          signOut();
          toast.success("Signed out");
          onNavigate();
          openLogin("signin", "/account");
        },
      }
    : item.to
    ? { to: item.to, onClick: onNavigate }
    : { onClick: () => { goToLabel(item.label); onNavigate(); } };
  return (
    <Cmp
      {...props}
      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-border last:border-0 text-left ${isLogout ? "text-rose-600" : ""}`}
    >
      <item.Icon className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />
      <span className="flex-1 text-[13px] font-medium">{item.label}</span>
      {item.badge && (
        <span className="h-5 w-5 rounded-full bg-ink text-white text-[10px] font-bold grid place-items-center">
          {item.badge}
        </span>
      )}
      {!item.badge && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
    </Cmp>
  );
}
