import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopAccount } from "@/components/account/DesktopAccount";
import { MobileAccount } from "@/components/account/MobileAccount";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export const Route = createFileRoute("/account/")({
  head: () => ({
    meta: [
      { title: "My Account - ASL ORIGINALS" },
      { name: "description", content: "Manage your ASL ORIGINALS account, requests, rewards, wallet and support." },
      { property: "og:title", content: "My Account - ASL ORIGINALS" },
      { property: "og:description", content: "Manage your ASL ORIGINALS account, requests, rewards and wallet." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const isDesktop = useIsDesktop();
  const ok = useAuthGuard();
  if (!ok) return null;
  return (
    <>
      {isDesktop ? <DesktopAccount /> : <MobileAccount />}
      <Toaster position="top-center" />
    </>
  );
}
