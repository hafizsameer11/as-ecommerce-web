import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Star, Wallet, Crown, Gift } from "lucide-react";
import { MobileShell } from "@/components/shell/MobileShell";
import { useClubRewards } from "./rewardsData";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function MobileRewards() {
  const nav = useNavigate();
  const hydrate = useClubRewards((s) => s.hydrate);
  const tiers = useClubRewards((s) => s.tiers);
  const rewardsSummary = useClubRewards((s) => s.summary);
  const activities = useClubRewards((s) => s.activities);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const currentTierIndex = Math.max(
    0,
    tiers.findIndex((t) => t.label === rewardsSummary.tier || t.id === rewardsSummary.tier)
  );
  const progressPct = rewardsSummary.targetPts
    ? Math.min(100, (rewardsSummary.progressPts / rewardsSummary.targetPts) * 100)
    : 0;

  return (
    <MobileShell activeBottom="account" headerVariant="shop" showTopTabs={false} title="Rewards & Credits">
      <div className="px-3 pt-3 pb-6 space-y-2.5">
        <button onClick={() => nav({ to: "/account/rewards/redeem" })} className="w-full flex items-center gap-3 rounded-lg bg-ink text-white p-3 text-left">
          <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-gold shrink-0">
            <Crown className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[14px]">{rewardsSummary.tier} Member</div>
            <div className="text-[11px] text-white/70">
              {rewardsSummary.memberSince ? `Member since ${rewardsSummary.memberSince}` : "ASL Club"}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-white/70 shrink-0" />
        </button>

        <Link to="/account/rewards/redeem" className="w-full flex items-center justify-center gap-2 rounded-lg bg-gold text-white p-2.5 text-[13px] font-bold uppercase tracking-widest hover:opacity-90">
          <Gift className="h-4 w-4" /> Redeem Rewards
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => nav({ to: "/account/rewards/redeem" })} className="rounded-lg border border-border bg-card p-2.5 text-left">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                <Star className="h-3.5 w-3.5 fill-gold" strokeWidth={1.5} />
              </div>
              <div className="text-[11px] font-semibold">Points</div>
            </div>
            <div className="mt-2 text-lg font-bold leading-none text-foreground">
              {rewardsSummary.points.toLocaleString()} <span className="text-[10px] font-semibold text-foreground/70">pts</span>
            </div>
            <div className="text-[10px] text-foreground mt-1">≈ ₦{rewardsSummary.pointsValue.toLocaleString()}</div>
            <div className="text-[10px] font-semibold mt-1 flex items-center gap-0.5">How points work <ChevronRight className="h-2.5 w-2.5" /></div>
          </button>
          <button onClick={() => nav({ to: "/account/rewards/redeem" })} className="rounded-lg border border-border bg-card p-2.5 text-left">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted grid place-items-center shrink-0">
                <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
              </div>
              <div className="text-[11px] font-semibold truncate">Store Credit</div>
            </div>
            <div className="mt-2 text-lg font-bold leading-none text-foreground">₦{rewardsSummary.credit.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground mt-1">Available to use</div>
            <div className="text-[10px] font-semibold mt-1 flex items-center gap-0.5">View details <ChevronRight className="h-2.5 w-2.5" /></div>
          </button>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Progress to Next Tier</h2>
            <span className="text-[9px] font-semibold text-gold bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5">{rewardsSummary.tier} Member</span>
          </div>

          <div className="mt-4 relative grid grid-cols-4">
            <div className="absolute top-5 left-[12.5%] right-[12.5%] h-px bg-border" />
            <div className="absolute top-5 left-[12.5%] h-px bg-gold" style={{ width: `${(currentTierIndex / Math.max(1, tiers.length - 1)) * 75}%` }} />
            {tiers.map((t, i) => {
              const active = i <= currentTierIndex;
              return (
                <div key={t.id} className="relative flex flex-col items-center">
                  <div className={`h-10 w-10 rounded-full grid place-items-center border-2 bg-background ${active ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>
                    <Star className={`h-4 w-4 ${i === currentTierIndex ? "fill-gold" : ""}`} strokeWidth={1.5} />
                  </div>
                  <div className={`text-[10px] font-semibold mt-1.5 ${active ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</div>
                  <div className="text-[9px] text-muted-foreground">₦{t.pts.toLocaleString()}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-[11px]">You're <span className="font-semibold">₦{rewardsSummary.toNext.toLocaleString()}</span> away from {rewardsSummary.nextTier}</div>
          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gold" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-[10px] text-muted-foreground text-right mt-1">₦{rewardsSummary.progressPts.toLocaleString()} / ₦{rewardsSummary.targetPts.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Recent Activity</h2>
            <span className="text-[11px] font-semibold text-foreground/70">View all</span>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-2 divide-y divide-border">
            {activities.length === 0 ? (
              <div className="py-4 text-[12px] text-muted-foreground">No activity yet.</div>
            ) : (
              activities.map((a) => (
                <motion.div key={a.id} variants={staggerItem} className="flex items-center gap-3 py-2.5">
                  <div className="h-8 w-8 rounded-full bg-muted grid place-items-center shrink-0">
                    <a.Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold">{a.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{a.detail}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-[12px] font-semibold ${a.negative ? "text-rose-600" : "text-ink"}`}>{a.amount}</div>
                    <div className="text-[10px] text-muted-foreground">{a.date}</div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>
    </MobileShell>
  );
}
