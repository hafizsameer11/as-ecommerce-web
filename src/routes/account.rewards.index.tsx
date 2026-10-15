import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopRewards } from "@/components/account/DesktopRewards";
import { MobileRewards } from "@/components/account/MobileRewards";

export const Route = createFileRoute("/account/rewards/")({
  head: () => ({
    meta: [
      { title: "Rewards & Credits - ASL ORIGINALS" },
      { name: "description", content: "View your ASL ORIGINALS rewards balance, store credit, tier progress, and activity." },
      { property: "og:title", content: "Rewards & Credits - ASL ORIGINALS" },
      { property: "og:description", content: "Track your points, credits, and tier progress." },
    ],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopRewards /> : <MobileRewards />}
      <Toaster position="top-center" />
    </>
  );
}
