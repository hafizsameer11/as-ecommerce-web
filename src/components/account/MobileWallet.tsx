import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ChevronRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { MobileShell } from "@/components/shell/MobileShell";
import { quickActions } from "./walletData";
import { useWallet } from "@/lib/wallet-store";
import { staggerContainer, staggerItem } from "@/lib/motion";

function fmt(n: number) {
  return "₦" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MobileWallet() {
  const balance = useWallet((s) => s.balance);
  const totalSpent = useWallet((s) => s.totalSpent);
  const transactions = useWallet((s) => s.txns);
  const hydrate = useWallet((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (
    <MobileShell activeBottom="account" headerVariant="shop" showTopTabs={false} title="Wallet & Transactions">
      <div className="px-3 pt-3 pb-6 space-y-3">
        {/* Balance card */}
        <Link to="/account/wallet/topup" className="w-full flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left">
          <div className="h-11 w-11 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
            <CreditCard className="h-5 w-5" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-muted-foreground font-semibold">Wallet Balance</div>
            <div className="text-2xl font-bold leading-tight">{fmt(balance)}</div>
            <div className="text-[10px] text-muted-foreground">Available to use</div>
            <div className="text-[11px] text-gold font-semibold mt-1 flex items-center gap-0.5">Add Money <ChevronRight className="h-3 w-3" /></div>
          </div>
        </Link>

        {/* Total spent / transactions count */}
        <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="text-[10px] text-muted-foreground font-semibold">Total Spent</div>
            <div className="text-base font-bold leading-tight mt-1">{fmt(totalSpent)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">All time</div>
          </div>
            <div className="rounded-lg border border-border bg-card p-2.5">
            <div className="text-[10px] text-muted-foreground font-semibold">Transactions</div>
            <div className="font-display text-base font-bold leading-tight mt-1">{transactions.length}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Total</div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="font-display text-[15px] font-bold">Quick Actions</h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickActions.map((a) => {
              const Cmp: any = a.to ? Link : "button";
              const props: any = a.to ? { to: a.to } : { onClick: () => toast(a.label) };
              return (
                <Cmp key={a.id} {...props} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="h-11 w-11 rounded-full bg-muted grid place-items-center">
                    <a.Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="text-[10px] font-semibold leading-tight">{a.label}</div>
                </Cmp>
              );
            })}

          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold">Recent Transactions</h2>
            <span className="text-[11px] font-semibold text-foreground/70 flex items-center gap-0.5">View all <ChevronRight className="h-3 w-3" /></span>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="mt-2 divide-y divide-border rounded-xl border border-border bg-card px-3">
            {transactions.slice(0, 8).map((t) => (
              <motion.div key={t.id} variants={staggerItem} className="flex items-center gap-3 py-3">
                <div className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${t.type === "Credit" ? "bg-ink text-white" : "bg-rose-100 text-rose-700"}`}>
                  <ChevronRight className={`h-4 w-4 ${t.type === "Credit" ? "rotate-90" : "-rotate-90"}`} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate">{t.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{t.date} · {t.time}</div>
                </div>
                <div className={`text-[12px] font-semibold shrink-0 ${t.type === "Credit" ? "text-ink" : "text-rose-600"}`}>
                  {t.type === "Credit" ? "+" : "-"}{fmt(t.amount)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </MobileShell>
  );

}
