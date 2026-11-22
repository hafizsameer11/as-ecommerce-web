import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { accountApi } from "@/lib/api/account";
import { useWallet } from "@/lib/wallet-store";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopWallet } from "@/components/account/DesktopWallet";
import { MobileWallet } from "@/components/account/MobileWallet";

type WalletSearch = { reference?: string; trxref?: string };

export const Route = createFileRoute("/account/wallet/")({
  validateSearch: (s: Record<string, unknown>): WalletSearch => ({
    reference: typeof s.reference === "string" && s.reference ? s.reference : undefined,
    trxref: typeof s.trxref === "string" && s.trxref ? s.trxref : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Wallet & Transactions - ASL ORIGINALS" },
      { name: "description", content: "Manage your ASL ORIGINALS wallet balance and view all your transactions." },
      { property: "og:title", content: "Wallet & Transactions - ASL ORIGINALS" },
      { property: "og:description", content: "View wallet balance, quick actions, and transaction history." },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const isDesktop = useIsDesktop();
  const { reference, trxref } = Route.useSearch();
  const navigate = useNavigate();
  const hydrate = useWallet((s) => s.hydrate);
  const payRef = reference || trxref;

  // Returning from the payment page (same-tab redirect): verify the top-up so the credit is recorded.
  useEffect(() => {
    if (!payRef) return;
    let cancelled = false;
    void (async () => {
      try {
        await accountApi.verifyPayment(payRef);
        if (!cancelled) toast.success("Payment confirmed — wallet updated");
      } catch {
        if (!cancelled) toast("We're confirming your payment — your balance will update shortly");
      } finally {
        await hydrate();
        if (!cancelled) void navigate({ to: "/account/wallet", search: {}, replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payRef, hydrate, navigate]);
  return (
    <>
      {isDesktop ? <DesktopWallet /> : <MobileWallet />}
      <Toaster position="top-center" />
    </>
  );
}
