import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { motion } from "framer-motion";
import { Copy, Share2, Users, Gift, TrendingUp, Mail, MessageCircle } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { fadeInUp } from "@/lib/motion";
import { useMyReferrals } from "@/lib/referrals-store";

export const Route = createFileRoute("/account/referrals")({
  head: () => ({ meta: [{ title: "Invite Friends - ASL ORIGINALS" }, { name: "description", content: "Invite friends and earn rewards for every signup." }] }),
  component: Referrals,
});

function Referrals() {
  const hydrate = useMyReferrals((s) => s.hydrate);
  const code = useMyReferrals((s) => s.code);
  const link = useMyReferrals((s) => s.link);
  const subhead = useMyReferrals((s) => s.subhead);
  const stats = useMyReferrals((s) => s.stats);
  const friends = useMyReferrals((s) => s.friends);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const copy = (text: string, label: string) => {
    if (!text) {
      toast.error("Referral details not loaded yet");
      return;
    }
    navigator.clipboard?.writeText(text);
    toast.success(`${label} copied`);
  };

  const share = (channel: string) => {
    if (!link) {
      toast.error("Referral link not ready");
      return;
    }
    const text = encodeURIComponent(`Join ASL ORIGINALS with my code ${code}: ${link}`);
    if (channel === "WhatsApp") {
      window.open(`https://wa.me/?text=${text}`, "_blank");
      return;
    }
    if (channel === "Email") {
      window.open(`mailto:?subject=${encodeURIComponent("Join ASL ORIGINALS")}&body=${text}`, "_blank");
      return;
    }
    if (navigator.share) {
      void navigator.share({ title: "ASL ORIGINALS", text: `Join with my code ${code}`, url: link });
      return;
    }
    copy(link, "Link");
  };

  const earnedLabel =
    stats.earned >= 1000 ? `₦${Math.round(stats.earned / 1000)}K` : `₦${stats.earned.toLocaleString()}`;

  return (
    <>
      <AccountInnerScaffold title="Invite Friends" subtitle={subhead} activeId="settings" backTo="/account">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="relative rounded-2xl overflow-hidden bg-ink text-white p-6">
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative">
            <Gift className="h-8 w-8 text-gold" />
            <h2 className="font-semibold text-2xl mt-3">Earn rewards</h2>
            <p className="text-[13px] text-white/70 mt-1">{subhead}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Invited", value: String(stats.invited), Icon: Users },
            { label: "Joined", value: String(stats.joined), Icon: TrendingUp },
            { label: "Earned", value: earnedLabel, Icon: Gift },
          ].map((s) => (
            <motion.div key={s.label} variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-4 text-center">
              <s.Icon className="h-5 w-5 mx-auto text-gold" />
              <div className="font-display font-bold text-lg mt-1">{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Your Referral Code</label>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-12 rounded-md border-2 border-dashed border-gold/40 bg-gold/5 grid place-items-center font-display font-bold text-lg tracking-widest text-gold">
                {code || "—"}
              </div>
              <button onClick={() => copy(code, "Code")} className="h-12 w-12 rounded-md bg-ink text-white grid place-items-center hover:bg-ink/90">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Referral Link</label>
            <div className="mt-2 flex items-center gap-2">
              <input readOnly value={link || ""} className="flex-1 h-11 px-3 rounded-md border border-border bg-muted/40 text-[12px]" />
              <button onClick={() => copy(link, "Link")} className="h-11 w-11 rounded-md border border-border bg-white grid place-items-center hover:bg-muted">
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { l: "WhatsApp", I: MessageCircle, c: "bg-ink" },
              { l: "Email", I: Mail, c: "bg-ink" },
              { l: "Share", I: Share2, c: "bg-gold" },
            ].map(({ l, I, c }) => (
              <button
                key={l}
                onClick={() => share(l)}
                className={`h-11 rounded-md ${c} text-white text-[12px] font-semibold inline-flex items-center justify-center gap-2 hover:opacity-90`}
              >
                <I className="h-4 w-4" /> {l}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="rounded-2xl border border-border bg-white p-5">
          <h2 className="font-display font-bold text-[13px] tracking-widest uppercase mb-3">Recent Invites</h2>
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-[13px] text-muted-foreground py-2">No invites yet — share your code to get started.</div>
            ) : (
              friends.map((r) => (
                <div key={`${r.name}-${r.status}`} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="font-semibold text-[13px]">{r.name}</div>
                    <div className="text-[11px] text-muted-foreground">{r.status}</div>
                  </div>
                  <div className={`text-[13px] font-bold ${r.reward === " - " ? "text-muted-foreground" : "text-ink"}`}>{r.reward}</div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
