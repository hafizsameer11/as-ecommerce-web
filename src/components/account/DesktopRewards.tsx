import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Star, Wallet, Gift } from "lucide-react";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { AccountSidebar } from "./AccountSidebar";
import { useClubRewards, earnMethods } from "./rewardsData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function DesktopRewards() {
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
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="rewards" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold">Rewards & Credits</h1>
              <p className="text-sm text-muted-foreground mt-2">View your rewards balance, credits, and history.</p>
            </div>
            <Link to="/account/rewards/redeem" className="inline-flex items-center gap-2 bg-gold text-white text-[13px] font-bold uppercase tracking-widest px-5 py-2.5 rounded-md hover:opacity-90">
              <Gift className="h-4 w-4" /> Redeem
            </Link>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-5 grid grid-cols-2 gap-8 divide-x divide-border">
            <button onClick={() => nav({ to: "/account/rewards/redeem" })} className="flex items-center gap-5 text-left">
              <div className="h-14 w-14 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                <Star className="h-6 w-6 fill-gold" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground font-semibold">Available Points</div>
                <div className="text-2xl font-bold mt-1 text-foreground">
                  {rewardsSummary.points.toLocaleString()} <span className="text-sm text-foreground/70 font-semibold">pts</span>
                </div>
                <div className="text-[12px] text-foreground mt-1">≈ ₦{rewardsSummary.pointsValue.toLocaleString()} value</div>
                <div className="text-[12px] text-foreground/80 font-semibold mt-2 flex items-center gap-1">How points work <ChevronRight className="h-3 w-3" /></div>
              </div>
            </button>
            <button onClick={() => nav({ to: "/account/rewards/redeem" })} className="flex items-center gap-5 pl-8 text-left">
              <div className="h-14 w-14 rounded-full bg-muted grid place-items-center shrink-0">
                <Wallet className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground font-semibold">Store Credit</div>
                <div className="text-2xl font-bold mt-1 text-foreground">₦{rewardsSummary.credit.toLocaleString()}</div>
                <div className="text-[12px] text-muted-foreground mt-1">Available to use</div>
                <div className="text-[12px] text-foreground/80 font-semibold mt-2 flex items-center gap-1">View credit details <ChevronRight className="h-3 w-3" /></div>
              </div>
            </button>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Your Progress to Next Tier</h2>
              <span className="text-[11px] font-semibold text-gold bg-gold/10 border border-gold/20 rounded px-2 py-1">{rewardsSummary.tier} Member</span>
            </div>

            <div className="mt-6 relative grid grid-cols-4">
              <div className="absolute top-6 left-[12.5%] right-[12.5%] h-px bg-border" />
              <div className="absolute top-6 left-[12.5%] h-px bg-gold" style={{ width: `${(currentTierIndex / Math.max(1, tiers.length - 1)) * 75}%` }} />
              {tiers.map((t, i) => {
                const active = i <= currentTierIndex;
                return (
                  <div key={t.id} className="relative flex flex-col items-center">
                    <div className={`h-12 w-12 rounded-full grid place-items-center border-2 bg-background ${active ? "border-gold text-gold" : "border-border text-muted-foreground"}`}>
                      <Star className={`h-5 w-5 ${i === currentTierIndex ? "fill-gold" : ""}`} strokeWidth={1.5} />
                    </div>
                    <div className={`text-[12px] font-semibold mt-2 ${active ? "text-foreground" : "text-muted-foreground"}`}>{t.label}</div>
                    <div className="text-[11px] text-muted-foreground">₦{t.pts.toLocaleString()}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center justify-between text-[12px]">
              <div>You're <span className="font-semibold">₦{rewardsSummary.toNext.toLocaleString()}</span> away from {rewardsSummary.nextTier}</div>
              <div className="text-muted-foreground">₦{rewardsSummary.progressPts.toLocaleString()} / ₦{rewardsSummary.targetPts.toLocaleString()}</div>
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${progressPct}%` }} />
            </div>
          </motion.div>

          <div className="grid grid-cols-[1.3fr_1fr] gap-5">
            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-xl border border-border bg-card p-5">
              <h2 className="font-display text-lg font-bold">Recent Activity</h2>
              <div className="mt-4 divide-y divide-border">
                {activities.length === 0 ? (
                  <div className="py-6 text-[13px] text-muted-foreground">No activity yet.</div>
                ) : (
                  activities.map((a) => (
                    <motion.div key={a.id} variants={staggerItem} className="flex items-center gap-3 py-3">
                      <div className="h-9 w-9 rounded-full bg-muted grid place-items-center shrink-0">
                        <a.Icon className="h-4 w-4" strokeWidth={1.75} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold">{a.title}</div>
                        <div className="text-[11px] text-muted-foreground">{a.detail}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-[13px] font-semibold ${a.negative ? "text-rose-600" : "text-ink"}`}>{a.amount}</div>
                        <div className="text-[11px] text-muted-foreground">{a.date}</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-xl bg-gold/5 border border-gold/20 p-5">
              <h2 className="font-display text-lg font-bold">How to Earn Points</h2>
              <div className="mt-4 space-y-4">
                {earnMethods.map((m) => (
                  <motion.div key={m.title} variants={staggerItem} className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-background border border-border grid place-items-center shrink-0 text-ink">
                      <m.Icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold">{m.title}</div>
                      <div className="text-[11px] text-muted-foreground">{m.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
