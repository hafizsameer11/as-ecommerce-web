import { motion } from "framer-motion";
import { ChevronRight, Crown, Star } from "lucide-react";
import { toast } from "sonner";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { useNavigate } from "@tanstack/react-router";
import { AccountSidebar } from "./AccountSidebar";
import { benefits, moreBenefits } from "./benefitsData";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export function DesktopBenefits() {
  const nav = useNavigate();
  return (
    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="benefits" />

        <div>
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-3xl font-bold">Membership Benefits</h1>
            <p className="text-sm text-muted-foreground mt-2">Enjoy exclusive benefits and privileges as a valued member.</p>
          </motion.div>

          {/* Gold banner */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-6 rounded-xl border border-gold/30 bg-gold/5 p-5 grid grid-cols-[1fr_auto] gap-4 items-center"
          >
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-gold/15 grid place-items-center text-gold">
                <Crown className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-gold">GOLD MEMBER</div>
                <div className="text-[13px] text-muted-foreground">Thank you for being a valued member.</div>
              </div>
            </div>
            <button
              onClick={() => nav({ to: "/account/rewards" })}
              className="flex items-center gap-3 rounded-lg bg-card border border-border px-5 py-3 hover:shadow-sm transition-shadow"
            >
              <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-gold">
                <Star className="h-5 w-5 fill-gold" strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <div className="font-display text-xl font-bold leading-none">
                  2,450 <span className="text-[11px] font-semibold text-muted-foreground">pts</span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">Available Points</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
            </button>
          </motion.div>

          {/* Benefits list */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-4 space-y-3">
            {benefits.map((b) => (
              <motion.button
                key={b.id}
                variants={staggerItem}
                onClick={() => toast(b.title, { description: b.desc })}
                className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-5 rounded-xl border border-border bg-card p-5 text-left hover:shadow-sm transition-shadow"
              >
                <div className="h-12 w-12 rounded-full bg-muted grid place-items-center text-ink">
                  <b.Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-semibold text-[15px]">{b.title}</div>
                  <div className="text-[13px] text-muted-foreground mt-1">{b.desc}</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.button>
            ))}

            <motion.div
              variants={staggerItem}
              className="rounded-xl bg-gold/10 border border-gold/20 p-5 flex items-center gap-5"
            >
              <div className="h-12 w-12 rounded-full bg-gold/15 grid place-items-center text-gold">
                <moreBenefits.Icon className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div>
                <div className="font-semibold text-[15px]">{moreBenefits.title}</div>
                <div className="text-[13px] text-muted-foreground mt-1">{moreBenefits.desc}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </DesktopShell>
  );
}
