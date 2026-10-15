import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopReturns } from "@/components/account/DesktopReturns";
import { MobileReturns } from "@/components/account/MobileReturns";

export const Route = createFileRoute("/account/returns/")({
  head: () => ({
    meta: [
      { title: "Returns & Refunds - ASL ORIGINALS" },
      { name: "description", content: "Read our return policy, request a return, and track your refund with ASL ORIGINALS." },
      { property: "og:title", content: "Returns & Refunds - ASL ORIGINALS" },
      { property: "og:description", content: "Hassle-free returns and refunds in 5 - 10 working days." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopReturns /> : <MobileReturns />}
      <Toaster position="top-center" />
    </>
  );
}
