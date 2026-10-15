import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { useWallet } from "@/lib/wallet-store";
import { accountApi, type ApiBankAccount } from "@/lib/api/account";

export const Route = createFileRoute("/account/wallet/withdraw")({
  head: () => ({
    meta: [
      { title: "Withdraw - ASL ORIGINALS" },
      { name: "description", content: "Withdraw funds from your ASL ORIGINALS wallet." },
    ],
  }),
  component: Withdraw,
});

const NGN = new Intl.NumberFormat("en-NG");

function bankLabel(b: ApiBankAccount) {
  const last4 = b.accountNumber.slice(-4);
  return `${b.bankName} · **** ${last4}${b.accountName ? ` (${b.accountName})` : ""}`;
}

function Withdraw() {
  const nav = useNavigate();
  const balance = useWallet((s) => s.balance);
  const withdraw = useWallet((s) => s.withdraw);
  const [amount, setAmount] = useState(Math.min(25000, balance || 25000));
  const [accounts, setAccounts] = useState<ApiBankAccount[]>([]);
  const [bankId, setBankId] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const rows = await accountApi.bankAccounts();
        if (cancelled) return;
        setAccounts(rows);
        const preferred = rows.find((a) => a.isDefault) ?? rows[0];
        if (preferred) setBankId(preferred.id);
      } catch (err) {
        console.warn("[withdraw] bank accounts", err);
        if (!cancelled) toast.error("Could not load bank accounts");
      } finally {
        if (!cancelled) setLoadingBanks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankId) return toast.error("Add a bank account before withdrawing");
    if (amount < 1000) return toast.error("Minimum withdrawal is ₦1,000");
    if (amount > balance) return toast.error("Insufficient balance");
    if (busy) return;
    setBusy(true);
    try {
      await withdraw(amount, bankId);
      toast.success(`Withdrawal of ₦${NGN.format(amount)} initiated`);
      nav({ to: "/account/wallet" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title="Withdraw Funds"
        subtitle={`Available balance: ₦${NGN.format(balance)}`}
        activeId="wallet"
        backTo="/account/wallet"
      >
        <form onSubmit={submit} className="rounded-2xl border border-border bg-white p-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              Amount
            </label>
            <input
              type="number"
              min={1000}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-2 w-full h-14 px-4 rounded-md border border-border bg-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-gold/30"
            />
            <button
              type="button"
              onClick={() => setAmount(balance)}
              className="mt-2 text-[12px] font-semibold text-gold hover:underline"
            >
              Withdraw all (₦{NGN.format(balance)})
            </button>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
              Bank Account
            </label>
            {loadingBanks ? (
              <p className="mt-1.5 text-[13px] text-muted-foreground py-3">Loading accounts…</p>
            ) : accounts.length === 0 ? (
              <p className="mt-1.5 text-[13px] text-muted-foreground py-3">
                No saved bank accounts yet. Add one from wallet settings, then try again.
              </p>
            ) : (
              <select
                value={bankId}
                onChange={(e) => setBankId(e.target.value)}
                className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-white text-[13px]"
              >
                {accounts.map((b) => (
                  <option key={b.id} value={b.id}>
                    {bankLabel(b)}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground bg-muted/40 rounded-md p-3">
            Withdrawals process within 1 - 3 business days.
          </div>
          <button
            type="submit"
            disabled={!bankId || busy || loadingBanks}
            className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[14px] hover:bg-ink/90 disabled:opacity-50"
          >
            {busy ? "Processing…" : "Confirm Withdrawal"}
          </button>
        </form>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
