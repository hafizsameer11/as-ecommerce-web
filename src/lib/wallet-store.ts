import { create } from "zustand";
import { persist } from "zustand/middleware";
import { accountApi, koboToNaira, nairaToKobo, type ApiWalletTx } from "@/lib/api/account";

export type WalletTxn = {
  id: string;
  date: string;
  time: string;
  title: string;
  sub: string;
  type: "Credit" | "Debit";
  amount: number;
  status: "Completed" | "Pending" | "Failed";
};

type State = {
  balance: number;
  totalSpent: number;
  txns: WalletTxn[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  credit: (amount: number, title: string, sub?: string) => void;
  debit: (amount: number, title: string, sub?: string) => boolean;
  topup: (amountNaira: number, returnUrl?: string) => Promise<{ authorizationUrl?: string | null; reference: string }>;
  withdraw: (amountNaira: number, bankAccountId: string) => Promise<void>;
};

function mapTx(t: ApiWalletTx): WalletTxn {
  const d = new Date(t.createdAt);
  const amount = Math.abs(koboToNaira(t.amount));
  const status =
    t.status === "pending" ? "Pending" : t.status === "failed" ? "Failed" : "Completed";
  return {
    id: t.id,
    date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    title: t.title,
    sub: t.subtitle ?? "",
    type: t.amount >= 0 ? "Credit" : "Debit",
    amount,
    status,
  };
}

function now() {
  const d = new Date();
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

export const useWallet = create<State>()(
  persist(
    (set, get) => ({
      balance: 0,
      totalSpent: 0,
      txns: [],
      hydrated: false,
      hydrate: async () => {
        try {
          const [summary, txns] = await Promise.all([
            accountApi.wallet(),
            accountApi.walletTransactions().catch(() => [] as ApiWalletTx[]),
          ]);
          set({
            balance: koboToNaira(summary.balance),
            totalSpent: koboToNaira(summary.totalSpent),
            txns: (txns.length ? txns : summary.recent ?? []).map(mapTx),
            hydrated: true,
          });
        } catch (err) {
          console.warn("[wallet] hydrate failed", err);
          set({ hydrated: true });
        }
      },
      credit: (amount, title, sub = "") => {
        if (amount <= 0) return;
        const { date, time } = now();
        set((s) => ({
          balance: s.balance + amount,
          txns: [
            { id: `t${Date.now()}`, date, time, title, sub, type: "Credit", amount, status: "Completed" },
            ...s.txns,
          ],
        }));
      },
      debit: (amount, title, sub = "") => {
        if (amount <= 0 || get().balance < amount) return false;
        const { date, time } = now();
        set((s) => ({
          balance: s.balance - amount,
          totalSpent: s.totalSpent + amount,
          txns: [
            { id: `t${Date.now()}`, date, time, title, sub, type: "Debit", amount, status: "Completed" },
            ...s.txns,
          ],
        }));
        return true;
      },
      topup: async (amountNaira, returnUrl) => {
        const res = await accountApi.walletTopup({
          amount: nairaToKobo(amountNaira),
          method: "card",
          returnUrl,
        });
        return res;
      },
      withdraw: async (amountNaira, bankAccountId) => {
        await accountApi.walletWithdraw({
          amount: nairaToKobo(amountNaira),
          bankAccountId,
        });
        await get().hydrate();
      },
    }),
    {
      name: "asl-wallet",
      partialize: (s) => ({ balance: s.balance, totalSpent: s.totalSpent, txns: s.txns }),
    }
  )
);
