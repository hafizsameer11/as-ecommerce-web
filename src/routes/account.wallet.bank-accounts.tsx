import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { Landmark, Plus, Trash2, Check } from "lucide-react";
import { AccountInnerScaffold } from "@/components/account/AccountInnerScaffold";
import { accountApi, type ApiBank, type ApiBankAccount } from "@/lib/api/account";

export const Route = createFileRoute("/account/wallet/bank-accounts")({
  head: () => ({
    meta: [
      { title: "Bank Accounts - ASL ORIGINALS" },
      { name: "description", content: "Manage the bank accounts you withdraw your wallet balance to." },
    ],
  }),
  component: BankAccounts,
});

function BankAccounts() {
  const [accounts, setAccounts] = useState<ApiBankAccount[]>([]);
  const [banks, setBanks] = useState<ApiBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setAccounts(await accountApi.bankAccounts());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not load bank accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!adding || banks.length > 0) return;
    void accountApi
      .banks()
      .then(setBanks)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Could not load banks"));
  }, [adding, banks.length]);

  // Resolve the account name once bank + 10-digit NUBAN are present.
  useEffect(() => {
    setResolvedName(null);
    if (!bankCode || !/^\d{10}$/.test(accountNumber)) return;
    let cancelled = false;
    setResolving(true);
    accountApi
      .resolveBankAccount({ bankCode, accountNumber })
      .then((r) => {
        if (!cancelled) setResolvedName(r.accountName);
      })
      .catch((err) => {
        if (!cancelled) toast.error(err instanceof Error ? err.message : "Could not verify account");
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bankCode, accountNumber]);

  const resetForm = () => {
    setAdding(false);
    setBankCode("");
    setAccountNumber("");
    setResolvedName(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankCode) return toast.error("Choose your bank");
    if (!/^\d{10}$/.test(accountNumber)) return toast.error("Enter a valid 10-digit account number");
    if (!resolvedName) return toast.error("We couldn't verify this account yet");
    if (saving) return;
    setSaving(true);
    try {
      await accountApi.addBankAccount({ bankCode, accountNumber });
      toast.success("Bank account added");
      resetForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add bank account");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (account: ApiBankAccount) => {
    if (removingId) return;
    if (!window.confirm(`Remove ${account.bankName} · **** ${account.accountNumber.slice(-4)}?`)) return;
    setRemovingId(account.id);
    try {
      await accountApi.removeBankAccount(account.id);
      toast.success("Bank account removed");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove bank account");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <>
      <AccountInnerScaffold
        title="Bank Accounts"
        subtitle="Accounts you can withdraw your wallet balance to."
        activeId="wallet"
        backTo="/account/wallet"
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-white divide-y divide-border">
            {loading ? (
              <p className="p-5 text-[13px] text-muted-foreground">Loading accounts…</p>
            ) : accounts.length === 0 ? (
              <p className="p-5 text-[13px] text-muted-foreground">
                No saved bank accounts yet. Add one to withdraw your wallet balance.
              </p>
            ) : (
              accounts.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-4">
                  <div className="h-10 w-10 rounded-full bg-muted grid place-items-center shrink-0">
                    <Landmark className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-semibold truncate">
                      {a.bankName} · **** {a.accountNumber.slice(-4)}
                      {a.isDefault && (
                        <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-gold">Default</span>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground truncate">{a.accountName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(a)}
                    disabled={removingId === a.id}
                    aria-label={`Remove ${a.bankName} account`}
                    className="h-9 w-9 grid place-items-center rounded-md border border-border text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {adding ? (
            <form onSubmit={save} className="rounded-2xl border border-border bg-white p-5 space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-white text-[13px]"
                >
                  <option value="">{banks.length ? "Select your bank" : "Loading banks…"}</option>
                  {banks.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
                  Account number
                </label>
                <input
                  inputMode="numeric"
                  maxLength={10}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit account number"
                  className="mt-1.5 w-full h-11 px-3 rounded-md border border-border bg-white text-[13px]"
                />
                <div className="mt-2 min-h-[18px] text-[12px]">
                  {resolving ? (
                    <span className="text-muted-foreground">Verifying account…</span>
                  ) : resolvedName ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-ink">
                      <Check className="h-3.5 w-3.5 text-gold" /> {resolvedName}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-11 px-5 rounded-md border border-border text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || resolving || !resolvedName}
                  className="flex-1 h-11 rounded-md bg-ink text-white text-[13px] font-semibold hover:bg-ink/90 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save bank account"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="w-full h-12 rounded-md border border-dashed border-ink/30 bg-white text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:border-ink"
            >
              <Plus className="h-4 w-4" /> Add bank account
            </button>
          )}

          {accounts.length > 0 && (
            <Link
              to="/account/wallet/withdraw"
              className="block text-center text-[12px] font-semibold text-gold hover:underline"
            >
              Continue to withdraw →
            </Link>
          )}
        </div>
      </AccountInnerScaffold>
      <Toaster position="top-center" />
    </>
  );
}
