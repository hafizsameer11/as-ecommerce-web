import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Gift, Truck, Percent, Sparkles, Coffee, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";
import { loyaltyApi, type ClubRewardCard, type ClubSummary } from "@/lib/api/loyalty";

export const Route = createFileRoute("/account/rewards/redeem")({
  head: () => ({ meta: [{ title: "Redeem Rewards - ASL ORIGINALS" }, { name: "description", content: "Redeem your ASL Club points for exclusive perks." }] }),
  component: Redeem,
});

const NGN = new Intl.NumberFormat("en-NG");

const ICON_FOR: Record<string, typeof Gift> = {
  credit: ShoppingBag,
  shipping: Truck,
  coupon: Percent,
  gift: Gift,
  concierge: Sparkles,
  event: Coffee,
};

function Redeem() {
  const nav = useNavigate();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<ClubRewardCard[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([loyaltyApi.clubSummary(), loyaltyApi.clubRewards()])
      .then(([summary, list]: [ClubSummary, ClubRewardCard[]]) => {
        setPoints(summary.points ?? 0);
        setRewards(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.warn("[rewards]", err));
  }, []);

  const redeem = async (r: ClubRewardCard) => {
    if (points < r.cost || r.canRedeem === false) {
      return toast.error(r.lockedReason || "Not enough points");
    }
    setBusyId(r.id);
    try {
      await loyaltyApi.redeemReward(r.id);
      toast.success(`Redeemed: ${r.title}`);
      const summary = await loyaltyApi.clubSummary();
      setPoints(summary.points ?? 0);
      nav({ to: "/account/rewards" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not redeem");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <AccountInnerScaffold title="Redeem Rewards" subtitle={`You have ${NGN.format(points)} points to spend.`} activeId="rewards" backTo="/account/rewards" maxWidth="max-w-5xl">
        {rewards.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-8 text-center text-[13px] text-muted-foreground">
            No rewards available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((r) => {
              const canRedeem = points >= r.cost && r.canRedeem !== false;
              const Icon = ICON_FOR[r.category] ?? Gift;
              return (
                <motion.div key={r.id} variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 flex gap-4">
                  <div className="h-14 w-14 rounded-full bg-gold/10 grid place-items-center shrink-0">
                    <Icon className="h-6 w-6 text-gold" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[14px]">{r.title}</div>
                    <div className="text-[12px] text-muted-foreground">{r.description || r.lockedReason || ""}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-[12px] font-bold text-gold">{NGN.format(r.cost)} pts</div>
                      <button
                        onClick={() => void redeem(r)}
                        disabled={!canRedeem || busyId === r.id}
                        className={`text-[12px] font-semibold px-3 py-1.5 rounded-md ${canRedeem ? "bg-ink text-white hover:bg-ink/90" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                      >
                        {busyId === r.id ? "…" : canRedeem ? "Redeem" : "Locked"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
