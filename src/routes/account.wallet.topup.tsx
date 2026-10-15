import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { CreditCard, Building2, Wallet as WalletIcon } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { useWallet } from "@/lib/wallet-store";

export const Route = createFileRoute("/account/wallet/topup")({
  head: () => ({ meta: [{ title: "Top Up Wallet - ASL ORIGINALS" }, { name: "description", content: "Add funds to your ASL ORIGINALS wallet." }] }),
  component: TopUp,
});

const presets = [5000, 10000, 25000, 50000, 100000, 250000];
const NGN = new Intl.NumberFormat("en-NG");

function TopUp() {
  const nav = useNavigate();
  const topup = useWallet((s) => s.topup);
  const [amount, setAmount] = useState(25000);
  const [method, setMethod] = useState<"card" | "bank" | "paypal">("card");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < 500) return toast.error("Minimum top-up is ₦500");
    if (method === "paypal") return toast.error("PayPal is not available yet — use card or transfer");
    if (busy) return;
    setBusy(true);
    try {
      const returnUrl = `${window.location.origin}/account/wallet`;
      const res = await topup(amount, returnUrl);
      if (res.authorizationUrl) {
        toast.success("Redirecting to payment…");
        window.location.href = res.authorizationUrl;
        return;
      }
      toast.success(`Wallet topped up with ₦${NGN.format(amount)}`);
      nav({ to: "/account/wallet" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Top-up failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <AccountInnerScaffold title="Top Up Wallet" subtitle="Add funds to your ASL ORIGINALS wallet." activeId="wallet" backTo="/account/wallet">
        <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-5 space-y-5">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Amount (NGN)</label>
            <input type="number" min={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="mt-2 w-full h-14 px-4 rounded-md border border-border bg-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-gold/30" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              {presets.map((p) => (
                <button key={p} type="button" onClick={() => setAmount(p)} className={`py-2 rounded-md border text-[12px] font-semibold ${amount === p ? "bg-ink text-white border-ink" : "bg-white border-border"}`}>
                  ₦{NGN.format(p)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Payment Method</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([{ v: "card", l: "Card", I: CreditCard }, { v: "bank", l: "Transfer", I: Building2 }, { v: "paypal", l: "PayPal", I: WalletIcon }] as const).map(({ v, l, I }) => (
                <button key={v} type="button" onClick={() => setMethod(v)} className={`flex flex-col items-center gap-1.5 py-3 rounded-md border ${method === v ? "bg-ink text-white border-ink" : "bg-white border-border"}`}>
                  <I className="h-5 w-5" />
                  <span className="text-[12px] font-semibold">{l}</span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={busy} className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[14px] hover:bg-ink/90 disabled:opacity-60">
            {busy ? "Processing…" : `Top Up ₦${NGN.format(amount)}`}
          </button>
        </form>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
