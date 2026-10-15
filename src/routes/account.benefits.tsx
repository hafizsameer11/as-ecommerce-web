import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopBenefits } from "@/components/account/DesktopBenefits";
import { MobileBenefits } from "@/components/account/MobileBenefits";

export const Route = createFileRoute("/account/benefits")({
  head: () => ({
    meta: [
      { title: "Membership Benefits - ASL ORIGINALS" },
      { name: "description", content: "Enjoy exclusive benefits and privileges as a valued ASL ORIGINALS member." },
      { property: "og:title", content: "Membership Benefits - ASL ORIGINALS" },
      { property: "og:description", content: "Exclusive perks, priority access, and dedicated concierge support." },
    ],
  }),
  component: BenefitsPage,
});

function BenefitsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopBenefits /> : <MobileBenefits />}
      <Toaster position="top-center" />
    </>
  );
}
