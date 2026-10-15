import { motion } from "framer-motion";
import { ChevronRight, Star } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { useNavigate } from "@tanstack/react-router";
import { benefits, moreBenefits } from "./benefitsData";
import { staggerContainer, staggerItem } from "@/lib/motion";

export function MobileBenefits() {
  const nav = useNavigate();
  return (
    <MobileShell activeBottom="account" headerVariant="shop" showTopTabs={false} title="Membership Benefits">
      <div className="px-3 pt-4 pb-6 space-y-3">
        {/* Profile card */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="h-14 w-14 rounded-full bg-ink text-white grid place-items-center font-display font-bold text-[10px] tracking-widest shrink-0">
            <div className="text-center">
              <div>ASL</div>
              <div className="text-[5px] tracking-[0.3em] text-white/70 -mt-0.5">ORIGINALS</div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-[14px]">Alex Johnson</div>
            <span className="inline-block mt-1 text-[10px] font-semibold text-gold bg-gold/10 border border-gold/20 rounded px-1.5 py-0.5">
              <Star className="inline h-3 w-3 fill-gold text-gold mr-1" /> Gold Member
            </span>
          </div>
        </div>

        {/* Points card */}
        <button
          onClick={() => nav({ to: "/account/rewards" })}
          className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left"
        >
          <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
            <Star className="h-5 w-5 fill-gold" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="font-display text-lg font-bold leading-none">
              2,450 <span className="text-[10px] font-semibold text-muted-foreground">pts</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">Available Points</div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        </button>

        {/* Benefits */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2.5">
          {benefits.map((b) => (
            <motion.button
              key={b.id}
              variants={staggerItem}
              whileTap={{ scale: 0.99 }}
              onClick={() => toast(b.title, { description: b.desc })}
              className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-left"
            >
              <div className="h-10 w-10 rounded-full bg-muted grid place-items-center text-ink shrink-0">
                <b.Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[13px]">{b.title}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{b.desc}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.button>
          ))}

          <motion.div
            variants={staggerItem}
            className="rounded-xl bg-gold/10 border border-gold/20 p-3.5 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
              <moreBenefits.Icon className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[13px]">{moreBenefits.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{moreBenefits.desc}</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </MobileShell>
  );
}
