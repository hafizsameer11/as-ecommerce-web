import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopWallet } from "@/components/account/DesktopWallet";
import { MobileWallet } from "@/components/account/MobileWallet";

export const Route = createFileRoute("/account/wallet/")({
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
  return (
    <>
      {isDesktop ? <DesktopWallet /> : <MobileWallet />}
      <Toaster position="top-center" />
    </>
  );
}
