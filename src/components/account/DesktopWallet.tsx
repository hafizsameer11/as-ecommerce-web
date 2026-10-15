import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { goToLabel } from "@/lib/nav-resolve";
import { motion } from "framer-motion";
import { ChevronRight, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { useNavigate } from "@tanstack/react-router";
import { AccountSidebar } from "./AccountSidebar";
import { quickActions } from "./walletData";
import { useWallet } from "@/lib/wallet-store";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

function fmt(n: number) {
  return "₦" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function DesktopWallet() {
  const nav = useNavigate();
  const balance = useWallet((s) => s.balance);
  const totalSpent = useWallet((s) => s.totalSpent);
  const transactions = useWallet((s) => s.txns);
  const hydrate = useWallet((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return (

    <DesktopShell active="Account">
      <div className="mx-auto max-w-[1600px] px-6 py-8 grid grid-cols-[260px_1fr] gap-8">
        <AccountSidebar activeId="wallet" />

        <div className="space-y-6">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <h1 className="font-display text-3xl font-bold">Wallet & Transactions</h1>
            <p className="text-sm text-muted-foreground mt-2">Manage your wallet balance and view all your transactions.</p>
          </motion.div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-5">
            <motion.button
              initial="hidden" animate="visible" variants={fadeInUp}
              onClick={() => nav({ to: "/account/wallet/topup" })}
              className="rounded-xl border border-border bg-card p-5 flex items-center gap-5 text-left"
            >
              <div className="h-14 w-14 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
                <CreditCard className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground font-semibold">Wallet Balance</div>
                <div className="text-2xl font-bold mt-1">{fmt(balance)}</div>
                <div className="text-[12px] text-muted-foreground mt-1">Available to use</div>
                <div className="text-[12px] text-gold font-semibold mt-2 flex items-center gap-1">Add Money <ChevronRight className="h-3 w-3" /></div>
              </div>
            </motion.button>

            <motion.button
              initial="hidden" animate="visible" variants={fadeInUp}
              
              className="rounded-xl border border-border bg-card p-5 flex items-center gap-5 text-left"
            >
              <div className="h-14 w-14 rounded-full bg-muted grid place-items-center shrink-0">
                <RefreshCw className="h-6 w-6" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-[12px] text-muted-foreground font-semibold">Total Spent</div>
                <div className="text-2xl font-bold mt-1">{fmt(totalSpent)}</div>
                <div className="text-[12px] text-muted-foreground mt-1">All time</div>
                <div className="text-[12px] text-gold font-semibold mt-2 flex items-center gap-1">View spending summary <ChevronRight className="h-3 w-3" /></div>
              </div>
            </motion.button>
          </div>

          {/* Quick actions */}
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {quickActions.map((a) => {
                const Cmp: any = a.to ? Link : "button";
                const props: any = a.to ? { to: a.to } : { onClick: () => goToLabel(a.label) };
                return (
                  <Cmp
                    key={a.id}
                    {...props}
                    className="rounded-xl border border-border bg-background p-4 flex items-center gap-3 text-left hover:border-ink/50 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-muted grid place-items-center shrink-0">
                      <a.Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold truncate">{a.label}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{a.desc}</div>
                    </div>
                  </Cmp>
                );
              })}

            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Recent Transactions</h2>
              <span className="text-[12px] font-semibold text-gold flex items-center gap-1">View all transactions <ChevronRight className="h-3 w-3" /></span>
            </div>

            <table className="w-full mt-4 text-[12px]">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-3 font-semibold">Date</th>
                  <th className="py-3 font-semibold">Description</th>
                  <th className="py-3 font-semibold">Type</th>
                  <th className="py-3 font-semibold">Amount</th>
                  <th className="py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <motion.tr key={t.id} variants={staggerItem} className="border-b border-border last:border-0">
                    <td className="py-4 text-muted-foreground whitespace-nowrap">{t.date} · {t.time}</td>
                    <td className="py-4">
                      <div className="font-semibold text-[13px]">{t.title}</div>
                      <div className="text-[11px] text-muted-foreground">{t.sub}</div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${t.type === "Credit" ? "bg-ink text-white" : "bg-rose-100 text-rose-700"}`}>{t.type}</span>
                    </td>
                    <td className={`py-4 font-semibold ${t.type === "Credit" ? "text-ink" : "text-rose-600"}`}>
                      {t.type === "Credit" ? "+" : "-"}{fmt(t.amount)}
                    </td>
                    <td className="py-4">
                      <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-ink text-white">{t.status}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
              <div>Showing 1 to {Math.min(transactions.length, 5)} of {transactions.length} transactions</div>
              <div className="flex items-center gap-1">
                <button className="h-7 w-7 rounded border border-border grid place-items-center">‹</button>
                <button className="h-7 w-7 rounded border border-ink bg-ink text-white grid place-items-center font-semibold">1</button>
                <button className="h-7 w-7 rounded border border-border grid place-items-center">2</button>
                <button className="h-7 w-7 rounded border border-border grid place-items-center">›</button>
              </div>
            </div>
          </motion.div>

          <div className="rounded-xl bg-gold/5 border border-gold/20 p-4 flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-gold/15 grid place-items-center text-gold shrink-0">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-[13px] font-semibold">Your payments are secure</div>
              <div className="text-[11px] text-muted-foreground">We use bank level security to protect your wallet and transactions.</div>
            </div>
          </div>
        </div>
      </div>
    </DesktopShell>
  );
}
