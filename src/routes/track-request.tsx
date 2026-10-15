import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopTrackRequest } from "@/components/track/DesktopTrackRequest";
import { MobileTrackRequest } from "@/components/track/MobileTrackRequest";

export const Route = createFileRoute("/track-request")({
  head: () => ({
    meta: [
      { title: "Track Your Request - ASL ORIGINALS Concierge" },
      { name: "description", content: "Stay updated with every step. Track your ASL ORIGINALS concierge request in real time from sourcing to delivery." },
      { property: "og:title", content: "Track Your Request - ASL ORIGINALS" },
      { property: "og:description", content: "Real-time tracking for your concierge request, sourcing to delivery." },
    ],
  }),
  validateSearch: z.object({ id: z.string().optional(), email: z.string().optional() }).parse,
  component: TrackRequestPage,
});

function TrackRequestPage() {
  const isDesktop = useIsDesktop();
  const { id, email } = Route.useSearch();
  return (
    <>
      {isDesktop ? <DesktopTrackRequest id={id} email={email} /> : <MobileTrackRequest id={id} email={email} />}
      <Toaster position="top-center" />
    </>
  );
}
