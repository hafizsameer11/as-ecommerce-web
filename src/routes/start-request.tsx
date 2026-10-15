import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopStartRequest } from "@/components/request/DesktopStartRequest";
import { MobileStartRequest } from "@/components/request/MobileStartRequest";

export const Route = createFileRoute("/start-request")({
  validateSearch: z.object({ productId: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Start a Request - ASL ORIGINALS Concierge" },
      { name: "description", content: "Tell us what you're looking for and our concierge team will source it for you. The more details you provide, the better we can help." },
      { property: "og:title", content: "Start a Request - ASL ORIGINALS Concierge" },
      { property: "og:description", content: "Submit your fashion concierge request. Our team will respond within 24 - 48 hours." },
    ],
  }),
  component: StartRequestPage,
});

function StartRequestPage() {
  const isDesktop = useIsDesktop();
  const { productId } = Route.useSearch();
  return (
    <>
      {isDesktop ? <DesktopStartRequest productId={productId} /> : <MobileStartRequest productId={productId} />}
      <Toaster position="top-center" />
    </>
  );
}
