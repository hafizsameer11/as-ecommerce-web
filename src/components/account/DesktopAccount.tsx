import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Crown,
  Wand2,
  Package,
  Heart,
  Wallet,
  Star,
  Bell,
  ArrowUpRight,
  MapPin,
  Truck,
  RefreshCw,
  Headphones,
  Gift,
  Plus,
} from "lucide-react";
import { StrokeRosetteCheckIcon } from "@/components/home/TrustIcons";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { overviewBenefits } from "./accountData";
import { useEffect } from "react";
import { useClubRewards } from "./rewardsData";
import { useWallet } from "@/lib/wallet-store";
import { formatNaira, orderStatusStyle } from "./ordersData";
import { useAllOrders, useOrders } from "@/lib/orders-store";
import { useAccountDisplayName } from "@/lib/auth-store";
import { useNotifications } from "./notificationsData";
import aslBag from "@/assets/asl-bag.png";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function DesktopAccount() {
  const displayName = useAccountDisplayName();
  const hydrateOrders = useOrders((s) => s.hydrate);
  const orders = useAllOrders();
  const recentOrder = orders[0];
  const notifications = useNotifications((s) => s.notifications);
  const unread = notifications.filter((n) => n.unread).slice(0, 3);
  const hydrate = useClubRewards((s) => s.hydrate);
  const hydrateNotifs = useNotifications((s) => s.hydrate);
  const rewardsSummary = useClubRewards((s) => s.summary);

  useEffect(() => {
    void hydrate();
    void hydrateNotifs();
    void hydrateOrders();
  }, [hydrate, hydrateNotifs, hydrateOrders]);

  const tierPct = Math.min(
    100,
    Math.round((rewardsSummary.progressPts / Math.max(1, rewardsSummary.targetPts)) * 100),
  );

  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="overview" />

        <div className="space-y-6">
          {/* Hero - Gold Member card */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="relative overflow-hidden rounded-3xl bg-ink text-white p-8"
          >
            {/* decorative gradient orbs */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />

            <div className="relative grid grid-cols-[1.2fr_1fr] gap-6 items-center">
              <motion.div variants={staggerItem} className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-3 py-1.5">
                  <Crown className="h-3.5 w-3.5 text-gold" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gold">
                    ASL Club · {rewardsSummary.tier} Member
                  </span>
                </div>
                <div>
                  <div className="text-white/60 text-sm">Welcome back,</div>
                  <h1 className="font-display text-3xl font-bold leading-tight mt-1">
                    {displayName}
                  </h1>
                  <p className="text-white/60 text-sm mt-2 max-w-md">
                    You're {rewardsSummary.toNext.toLocaleString()} points away from{" "}
                    <span className="text-gold font-semibold">{rewardsSummary.nextTier}</span>.
                    Keep enjoying exclusive perks and priority access.
                  </p>
                </div>

                {/* Tier progress */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-white/50 mb-2">
                    <span>{rewardsSummary.tier}</span>
                    <span>{rewardsSummary.nextTier}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${tierPct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300"
                    />
                  </div>
                  <div className="text-[11px] text-white/50 mt-2">
                    {rewardsSummary.progressPts.toLocaleString()} / {rewardsSummary.targetPts.toLocaleString()} pts
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to="/account/rewards"
                    className="inline-flex items-center gap-2 bg-gold text-ink text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-gold/90 transition-colors"
                  >
                    View Rewards <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/account/benefits"
                    className="inline-flex items-center gap-2 border border-white/20 text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-white/10 transition-colors"
                  >
                    Club Benefits
                  </Link>
                </div>
              </motion.div>

              {/* Stat tiles */}
              <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
                <StatTile
                  Icon={Star}
                  label="Reward Points"
                  value={rewardsSummary.points.toLocaleString()}
                  hint={`≈ ${formatNaira(rewardsSummary.pointsValue)}`}
                  to="/account/rewards"
                />
                <StatTile
                  Icon={Wallet}
                  label="Wallet Balance"
                  value={formatNaira(useWallet.getState().balance)}
                  hint={`${useWallet.getState().txns.length} transactions`}
                  to="/account/wallet"
                />
                <StatTile
                  Icon={Package}
                  label="Active Orders"
                  value="2"
                  hint="1 in transit"
                  to="/account/orders"
                />
                <StatTile
                  Icon={Heart}
                  label="Wishlist"
                  value="4"
                  hint="Items saved"
                  to="/account/wishlist"
                />
              </motion.div>
            </div>
          </motion.section>

          {/* Two-column: Recent order + Notifications */}
          <div className="grid grid-cols-[1.4fr_1fr] gap-6">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-border bg-white p-6"
            >
              <SectionHead title="Recent Order" to="/account/orders" cta="View all" />
              {!recentOrder || !recentOrder.items[0] ? (
                <div className="mt-4 rounded-xl bg-[#faf9f6] border border-border/70 p-6 text-[13px] text-muted-foreground text-center">
                  No orders yet.
                </div>
              ) : (
              <div className="mt-4 rounded-xl bg-[#faf9f6] border border-border/70 p-4">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl bg-[#edebdf] overflow-hidden shrink-0">
                    <img src={recentOrder.items[0].image} alt={recentOrder.items[0].name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-sans">{recentOrder.id}</span>
                      <span>·</span>
                      <span>{recentOrder.date}</span>
                    </div>
                    <div className="font-semibold text-[15px] mt-0.5 truncate">
                      {recentOrder.items[0].name}
                      {recentOrder.itemsCount > 1 && (
                        <span className="text-muted-foreground font-normal"> +{recentOrder.itemsCount - 1} more</span>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground">{recentOrder.items[0].variant}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${orderStatusStyle[recentOrder.status]}`}>
                      {recentOrder.status}
                    </span>
                    <div className="font-semibold text-lg mt-2">{formatNaira(recentOrder.total)}</div>
                  </div>
                </div>

                {recentOrder.eta && (
                  <div className="mt-4 pt-4 border-t border-border/70 flex items-center gap-3 text-[12px]">
                    <Truck className="h-4 w-4 text-gold" />
                    <span className="text-muted-foreground">Estimated delivery</span>
                    <span className="font-semibold text-ink">{recentOrder.eta}</span>
                    {recentOrder.tracking && (
                      <>
                        <span className="text-muted-foreground ml-auto">Tracking</span>
                        <span className="font-sans text-ink">{recentOrder.tracking}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
              )}
            </motion.div>

            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-border bg-white p-6"
            >
              <SectionHead title="Notifications" to="/account/notifications" cta="See all" />
              <ul className="mt-4 space-y-1">
                {unread.map((n) => (
                  <li key={n.id}>
                    <Link
                      to={n.ctaTo || "/account/notifications"}
                      className="flex items-start gap-3 rounded-xl p-3 hover:bg-muted/30 transition-colors group"
                    >
                      <div className="h-9 w-9 rounded-full bg-gold/10 grid place-items-center shrink-0">
                        <n.Icon className="h-4 w-4 text-gold" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-[13px] truncate">{n.title}</div>
                          <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                        </div>
                        <div className="text-[12px] text-muted-foreground line-clamp-1">{n.message}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{n.time}</div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Fashion Concierge CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden rounded-2xl bg-[#f5efe6] p-8"
          >
            <div className="absolute right-6 top-6 opacity-10">
              <Wand2 className="h-40 w-40 text-ink" />
            </div>
            <div className="relative max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                <Wand2 className="h-3 w-3" /> Fashion Concierge
              </div>
              <h2 className="font-display text-2xl font-bold mt-2">Can't find what you're looking for?</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Our concierge team sources any item globally. Just tell us what you want, and we'll bring it to you.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <Link
                  to="/start-request"
                  className="inline-flex items-center gap-2 bg-ink text-white text-[13px] font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-colors"
                >
                  <Plus className="h-4 w-4" /> Start a Request
                </Link>
                <Link
                  to="/account/requests"
                  className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink hover:text-gold transition-colors"
                >
                  View my requests <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl bg-[#f5f2ec] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-[15px] tracking-wide">ASL CLUB BENEFITS</h2>
              <Link to="/account/benefits" className="text-[12px] font-semibold text-ink flex items-center gap-1 hover:text-gold transition-colors">
                View all benefits <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {overviewBenefits.map((b) => (
                <div key={b.id} className="text-center">
                  <div className="relative h-16 w-16 mx-auto grid place-items-center">
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-[#e8ddc7]" aria-hidden>
                      <path fill="currentColor" d="M52.6 6.4c11 1.7 22.7 5.8 29.6 14 6.9 8.1 9 19.3 7.1 29.7-1.9 10.4-7.8 20-16.4 25.9-8.6 5.9-19.9 8.1-30.4 6.4-10.5-1.7-20.2-7.3-26.5-15.6C9.7 58.5 6.7 47.5 9.3 37.4c2.6-10.1 10.7-19.4 20.8-24.3 10.1-4.9 22.5-8.4 22.5-6.7z" />
                    </svg>
                    <b.Icon className="relative h-6 w-6 text-ink" strokeWidth={1.5} />
                  </div>
                  <div className="font-semibold text-[13px] mt-3 whitespace-pre-line leading-tight">{b.title}</div>
                  <div className="text-[11px] text-muted-foreground mt-1 leading-snug px-1 whitespace-pre-line">{b.desc}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions grid */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible">
            <h2 className="font-display font-bold text-[15px] tracking-wide mb-4">QUICK ACTIONS</h2>
            <div className="grid grid-cols-4 gap-3">
              <QuickAction Icon={Package} label="Orders" to="/account/orders" />
              <QuickAction Icon={Heart} label="Wishlist" to="/account/wishlist" badge="4" />
              <QuickAction Icon={MapPin} label="Addresses" to="/account/addresses" />
              <QuickAction Icon={RefreshCw} label="Returns" to="/account/returns" />
              <QuickAction Icon={Wallet} label="Wallet" to="/account/wallet" />
              <QuickAction Icon={Gift} label="Rewards" to="/account/rewards" />
              <QuickAction Icon={Bell} label="Notifications" to="/account/notifications" badge={String(unread.length)} />
              <QuickAction Icon={Headphones} label="Help" to="/account/help" />
            </div>
          </motion.div>

          {/* Thank you banner */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden rounded-2xl bg-ink text-white p-8 flex items-center justify-between min-h-[220px]"
          >
            <div className="max-w-md relative z-10">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Member Appreciation</div>
              <h2 className="font-display text-2xl font-bold mt-2 leading-tight">Thank you for being part of <span className="text-gold">ASL ORIGINALS</span></h2>
              <p className="text-sm text-white/70 mt-2">You're not just a customer, you're family. We're here to give you the best experience.</p>
              <button onClick={() => toast("Shop New Arrivals")} className="mt-4 bg-gold text-white text-[12px] font-semibold px-5 py-2.5 rounded-full flex items-center gap-1.5 hover:bg-gold/90 transition-colors">
                Shop New Arrivals <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-[45%]">
              <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent z-10" />
              <img src={aslBag} alt="ASL ORIGINALS shopping bag" className="h-full w-full object-contain object-right" />
            </div>

          </motion.div>

          {/* Trust badges */}
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="grid grid-cols-4 gap-4 py-6 border-t border-border">
            {[
              { Icon: StrokeRosetteCheckIcon, label: "100% Authentic", desc: "Guaranteed original" },
              { Icon: Truck, label: "Free Shipping", desc: "On orders over ₦50,000" },
              { Icon: RefreshCw, label: "7-Day Returns", desc: "Easy returns & exchanges" },
              { Icon: Headphones, label: "24/7 Support", desc: "We're here to help" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <t.Icon className="h-6 w-6 text-ink" strokeWidth={1.5} />
                <div>
                  <div className="font-semibold text-[13px]">{t.label}</div>
                  <div className="text-[11px] text-muted-foreground">{t.desc}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </DesktopShell>
  );
}

function StatTile({
  Icon,
  label,
  value,
  hint,
  to,
}: {
  Icon: typeof Star;
  label: string;
  value: string;
  hint: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-4 hover:bg-white/[0.08] transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-full bg-gold/15 grid place-items-center">
          <Icon className="h-4 w-4 text-gold" strokeWidth={1.8} />
        </div>
        <ArrowUpRight className="h-4 w-4 text-white/40 group-hover:text-gold transition-colors" />
      </div>
      <div className="font-display text-2xl font-bold mt-3 leading-none">{value}</div>
      <div className="text-[11px] text-white/60 mt-1">{label}</div>
      <div className="text-[10px] text-white/40 mt-0.5">{hint}</div>
    </Link>
  );
}

function SectionHead({ title, to, cta }: { title: string; to: string; cta: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display font-bold text-[15px] tracking-wide">{title.toUpperCase()}</h2>
      <Link to={to} className="text-[12px] font-semibold text-ink flex items-center gap-1 hover:text-gold transition-colors">
        {cta} <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function QuickAction({
  Icon,
  label,
  to,
  badge,
}: {
  Icon: typeof Star;
  label: string;
  to: string;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className="group relative rounded-2xl border border-border bg-white p-4 flex flex-col items-center gap-2 hover:border-gold hover:shadow-sm transition-all"
    >
      {badge && badge !== "0" && (
        <span className="absolute top-2 right-2 h-5 min-w-5 px-1.5 rounded-full bg-ink text-white text-[10px] font-bold grid place-items-center">
          {badge}
        </span>
      )}
      <div className="h-10 w-10 rounded-full bg-[#f5f2ec] grid place-items-center group-hover:bg-gold/15 transition-colors">
        <Icon className="h-5 w-5 text-ink group-hover:text-gold transition-colors" strokeWidth={1.5} />
      </div>
      <div className="font-semibold text-[12px]">{label}</div>
    </Link>
  );
}
