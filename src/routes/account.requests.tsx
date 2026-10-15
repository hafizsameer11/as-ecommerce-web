import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopRequests } from "@/components/account/DesktopRequests";
import { MobileRequests } from "@/components/account/MobileRequests";

export const Route = createFileRoute("/account/requests")({
  head: () => ({
    meta: [
      { title: "My Requests - ASL ORIGINALS" },
      { name: "description", content: "View and manage all your ASL ORIGINALS concierge requests." },
      { property: "og:title", content: "My Requests - ASL ORIGINALS" },
      { property: "og:description", content: "View and manage all your ASL ORIGINALS concierge requests." },
    ],
  }),
  component: RequestsPage,
});

function RequestsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopRequests /> : <MobileRequests />}
      <Toaster position="top-center" />
    </>
  );
}
