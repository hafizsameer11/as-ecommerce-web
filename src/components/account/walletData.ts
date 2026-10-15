import { Plus, ArrowUp, ArrowDown, CreditCard, FileText, LucideIcon } from "lucide-react";

export const walletSummary = {
  balance: 25000,
  totalSpent: 325000,
  transactionsCount: 8,
};

export type QuickAction = {
  id: string;
  label: string;
  desc: string;
  Icon: LucideIcon;
  to?: string;
};

export const quickActions: QuickAction[] = [
  { id: "add", label: "Add Money", desc: "Top up your wallet", Icon: Plus, to: "/account/wallet/topup" },
  { id: "withdraw", label: "Withdraw", desc: "Withdraw to bank", Icon: ArrowUp, to: "/account/wallet/withdraw" },
  { id: "methods", label: "Payment Methods", desc: "Manage your cards", Icon: CreditCard, to: "/account/payment-methods" },
  { id: "history", label: "Transaction History", desc: "View all transactions", Icon: FileText },
];


export type Txn = {
  id: string;
  date: string;
  time: string;
  title: string;
  sub: string;
  type: "Credit" | "Debit";
  amount: number;
  status: "Completed" | "Pending" | "Failed";
};

export const transactions: Txn[] = [
  { id: "t1", date: "May 25, 2024", time: "10:35 AM", title: "Added to wallet", sub: "Wallet top up", type: "Credit", amount: 25000, status: "Completed" },
  { id: "t2", date: "May 23, 2024", time: "02:15 PM", title: "Payment for Request #ASL123456", sub: "Air Jordan 1 Retro High OG", type: "Debit", amount: 180000, status: "Completed" },
  { id: "t3", date: "May 20, 2024", time: "11:40 AM", title: "Payment for Request #ASL123455", sub: "Louis Vuitton Keepall", type: "Debit", amount: 120000, status: "Completed" },
  { id: "t4", date: "May 18, 2024", time: "09:05 AM", title: "Refund for Request #ASL123454", sub: "Rolex Submariner Date", type: "Credit", amount: 120000, status: "Completed" },
  { id: "t5", date: "May 15, 2024", time: "03:30 PM", title: "Added to wallet", sub: "Wallet top up", type: "Credit", amount: 30000, status: "Completed" },
];
