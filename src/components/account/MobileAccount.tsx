import { Link } from "@tanstack/react-router";
import { goToLabel } from "@/lib/nav-resolve";
import { openAppStore } from "@/lib/app-store";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Crown,
  Wand2,
  Package,
  Heart,
  Wallet,
  Star,
  Bell,
  MapPin,
  RefreshCw,
  Gift,
  Headphones,
  ArrowUpRight,
  Plus,
  Truck,
  LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { overviewBenefits, mobileConciergeList, type MenuItem } from "./accountData";
import { useEffect } from "react";
import { useClubRewards } from "./rewardsData";
import { useWallet } from "@/lib/wallet-store";
import { formatNaira, orderStatusStyle } from "./ordersData";
import { useAllOrders, useOrders } from "@/lib/orders-store";
import { useAccountDisplayName } from "@/lib/auth-store";
import { useNotifications } from "./notificationsData";
import aslBag from "@/assets/asl-bag.png";
import { fadeInUp } from "@/lib/motion";

export function MobileAccount() {
  const displayName = useAccountDisplayName();
  const hydrateOrders = useOrders((s) => s.hydrate);
  const orders = useAllOrders();
  const recentOrder = orders[0];
  const notifications = useNotifications((s) => s.notifications);
  const unread = notifications.filter((n) => n.unread).slice(0, 2);
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
    <MobileShell activeBottom="account" headerVariant="account" showTopTabs={false}>
      <div className="px-3 pt-4 pb-8 space-y-4">
        {/* Hero - Gold Member */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="relative overflow-hidden rounded-lg bg-ink text-white p-4"
        >
          <div className="pointer-events-none absolute -top-16 -right-10 h-52 w-52 rounded-full bg-gold/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-white/10 border border-white/15 grid place-items-center shrink-0 backdrop-blur">
              <div className="text-center">
                <div className="font-display font-bold text-[13px] tracking-widest leading-none">ASL</div>
                <div className="text-[6px] tracking-[0.3em] text-white/70 mt-0.5">ORIGINALS</div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white/60 uppercase tracking-widest">Welcome back</div>
              <div className="font-display font-bold text-xl leading-tight truncate">{displayName}</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest bg-gold/20 text-gold px-2 py-0.5 rounded">
                <Crown className="h-3 w-3" /> {rewardsSummary.tier} Member
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-white/70 shrink-0" />
          </div>

          {/* Tier progress */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-white/50 mb-1.5">
              <span>{rewardsSummary.tier}</span>
              <span className="text-gold">{rewardsSummary.toNext.toLocaleString()} pts to {rewardsSummary.nextTier}</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tierPct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300"
              />
            </div>
          </div>

          {/* mini stats inside hero */}
          <div className="relative mt-4 grid grid-cols-2 gap-2">
            <MiniStat Icon={Star} label="Points" value={rewardsSummary.points.toLocaleString()} to="/account/rewards" />
            <MiniStat Icon={Wallet} label="Wallet" value={formatNaira(useWallet.getState().balance)} to="/account/wallet" />
          </div>
        </motion.section>

        {/* Quick actions grid - big-tap tiles */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-4 gap-2">
            <QuickTile Icon={Package} label="Orders" to="/account/orders" />
            <QuickTile Icon={Heart} label="Wishlist" to="/account/wishlist" badge="4" />
            <QuickTile Icon={RefreshCw} label="Returns" to="/account/returns" />
            <QuickTile Icon={Bell} label="Alerts" to="/account/notifications" badge={String(unread.length)} />
            <QuickTile Icon={MapPin} label="Address" to="/account/addresses" />
            <QuickTile Icon={Gift} label="Rewards" to="/account/rewards" />
            <QuickTile Icon={Wallet} label="Wallet" to="/account/wallet" />
            <QuickTile Icon={Headphones} label="Help" to="/account/help" />
          </div>
        </motion.div>

        {/* Recent order */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
           className="rounded-lg border border-border bg-white p-3"
        >
          <SectionHead title="Recent Order" to="/account/orders" cta="View all" />
          {!recentOrder || !recentOrder.items[0] ? (
            <div className="mt-3 text-[12px] text-muted-foreground text-center py-4">No orders yet.</div>
          ) : (
            <>
          <Link to="/account/orders" className="mt-3 flex items-center gap-3">
            <div className="h-16 w-16 rounded-xl bg-[#edebdf] overflow-hidden shrink-0">
              <img src={recentOrder.items[0].image} alt={recentOrder.items[0].name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-muted-foreground font-sans">{recentOrder.id}</div>
              <div className="font-semibold text-[13px] truncate">{recentOrder.items[0].name}</div>
              <div className="text-[11px] text-muted-foreground">{recentOrder.items[0].variant}</div>
              <span className={`mt-1 inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${orderStatusStyle[recentOrder.status]}`}>
                {recentOrder.status}
              </span>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold text-[13px]">{formatNaira(recentOrder.total)}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{recentOrder.date}</div>
            </div>
          </Link>
          {recentOrder.eta && (
            <div className="mt-3 pt-3 border-t border-border/70 flex items-center gap-2 text-[11px]">
              <Truck className="h-3.5 w-3.5 text-gold shrink-0" />
              <span className="text-muted-foreground">Arriving</span>
              <span className="font-semibold text-ink">{recentOrder.eta}</span>
            </div>
          )}
            </>
          )}
        </motion.section>

        {/* Fashion Concierge banner */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
           className="relative overflow-hidden rounded-lg bg-[#f5efe6] p-4"
        >
          <Wand2 className="absolute right-4 top-4 h-16 w-16 text-ink/5" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
              <Wand2 className="h-3 w-3" /> Fashion Concierge
            </div>
            <h3 className="font-display text-lg font-bold mt-1.5 leading-tight">Can't find it? We'll source it.</h3>
            <p className="text-[11px] text-muted-foreground mt-1 max-w-[85%]">
              Tell us what you want. Our team sources any item globally.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                to="/start-request"
                className="inline-flex items-center gap-1.5 bg-ink text-white text-[11px] font-semibold px-3.5 py-2 rounded-full"
              >
                <Plus className="h-3.5 w-3.5" /> New Request
              </Link>
              <Link
                to="/account/requests"
                className="text-[11px] font-semibold text-ink inline-flex items-center gap-1"
              >
                My requests <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Notifications preview */}
        {unread.length > 0 && (
          <motion.section
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
             className="rounded-lg border border-border bg-white p-3"
          >
            <SectionHead title="Notifications" to="/account/notifications" cta="See all" />
            <ul className="mt-2 divide-y divide-border/70">
              {unread.map((n) => (
                <li key={n.id}>
                  <Link to={n.ctaTo || "/account/notifications"} className="flex items-start gap-3 py-3">
                    <div className="h-8 w-8 rounded-full bg-gold/10 grid place-items-center shrink-0">
                      <n.Icon className="h-4 w-4 text-gold" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-[12px] truncate">{n.title}</div>
                        <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</div>
                      <div className="text-[9px] text-muted-foreground/70 mt-0.5">{n.time}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ASL Club Benefits - swipe */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
           className="rounded-lg border border-border bg-white p-3"
        >
          <SectionHead title="ASL Club Benefits" to="/account/benefits" cta="View all" />
          <div className="mt-3 -mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
            {overviewBenefits.map((b) => (
              <div key={b.id} className="snap-start shrink-0 w-[42%] rounded-xl bg-[#f5f2ec] p-3 text-center">
                <div className="relative h-12 w-12 mx-auto grid place-items-center">
                  <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full text-[#e8ddc7]" aria-hidden>
                    <path fill="currentColor" d="M52.6 6.4c11 1.7 22.7 5.8 29.6 14 6.9 8.1 9 19.3 7.1 29.7-1.9 10.4-7.8 20-16.4 25.9-8.6 5.9-19.9 8.1-30.4 6.4-10.5-1.7-20.2-7.3-26.5-15.6C9.7 58.5 6.7 47.5 9.3 37.4c2.6-10.1 10.7-19.4 20.8-24.3 10.1-4.9 22.5-8.4 22.5-6.7z" />
                  </svg>
                  <b.Icon className="relative h-5 w-5 text-ink" strokeWidth={1.5} />
                </div>
                <div className="font-semibold text-[11px] mt-2 leading-tight whitespace-pre-line">{b.title}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-snug whitespace-pre-line">{b.desc}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Fashion concierge group */}
        <GroupCard title="Fashion Concierge" Icon={Wand2} items={mobileConciergeList} />

        {/* Thank you */}
        <motion.section
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
           className="relative overflow-hidden rounded-lg bg-ink text-white"
        >
          <div className="relative z-10 flex items-center gap-3 px-5 py-6">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-[19px] font-bold leading-[1.2] tracking-tight">
                Thank you for being part of<br /><span>ASL ORIGINALS</span>
              </h2>
              <p className="text-[12px] text-white/60 mt-2 leading-relaxed">
                We're here to give you the best experience.
              </p>
              <button
                onClick={() => toast("Shop New Arrivals")}
                className="mt-4 bg-gold text-white text-[12px] font-semibold px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 active:scale-95 transition-transform whitespace-nowrap"
              >
                Shop New Arrivals <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <img
              src={aslBag}
              alt="ASL ORIGINALS shopping bag"
              className="w-[38%] shrink-0 object-contain"
            />
          </div>


        </motion.section>

      </div>
    </MobileShell>
  );
}

function MiniStat({ Icon, label, value, to }: { Icon: LucideIcon; label: string; value: string; to: string }) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-white/10 bg-white/[0.05] backdrop-blur p-2.5 flex items-center gap-2"
    >
      <div className="h-7 w-7 rounded-full bg-gold/15 grid place-items-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-gold" strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-widest text-white/50">{label}</div>
        <div className="font-display font-bold text-[13px] leading-tight truncate">{value}</div>
      </div>
    </Link>
  );
}

function QuickTile({ Icon, label, to, badge }: { Icon: LucideIcon; label: string; to: string; badge?: string }) {
  return (
    <Link
      to={to}
      className="relative rounded-lg border border-border bg-white p-2.5 flex flex-col items-center gap-1 active:scale-95 transition-transform"
    >
      {badge && badge !== "0" && (
        <span className="absolute top-1.5 right-1.5 h-4 min-w-4 px-1 rounded-full bg-ink text-white text-[9px] font-bold grid place-items-center">
          {badge}
        </span>
      )}
      <div className="h-9 w-9 rounded-full bg-[#f5f2ec] grid place-items-center">
        <Icon className="h-4 w-4 text-ink" strokeWidth={1.6} />
      </div>
      <div className="font-semibold text-[10px] text-center leading-tight">{label}</div>
    </Link>
  );
}

function SectionHead({ title, to, cta }: { title: string; to: string; cta: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display font-bold text-[12px] tracking-wide uppercase">{title}</h2>
      <Link to={to} className="text-[11px] font-semibold text-gold flex items-center gap-1">
        {cta} <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

function GroupCard({ title, Icon, items }: { title: string; Icon: LucideIcon; items: MenuItem[] }) {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <div className="flex items-center gap-2 px-1 mb-2">
        <Icon className="h-3.5 w-3.5 text-gold" />
        <h2 className="font-display font-bold text-[11px] tracking-widest uppercase">{title}</h2>
      </div>
      <div className="rounded-lg border border-border bg-white overflow-hidden">
        {items.map((m) => {
          const Wrapper: any = m.to && !m.external ? Link : "button";
          const wrapperProps: any = m.external
            ? { onClick: openAppStore }
            : m.to
            ? { to: m.to }
            : { onClick: () => goToLabel(m.label) };
          return (
            <Wrapper
              key={m.id}
              {...wrapperProps}
              className="w-full flex items-center gap-3 px-3 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors text-left"
            >
              <m.Icon className="h-5 w-5 text-foreground shrink-0" strokeWidth={1.5} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[14px]">{m.label}</div>
                <div className="text-[12px] text-muted-foreground mt-0.5">{m.desc}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
            </Wrapper>
          );
        })}
      </div>
    </motion.div>
  );
}
