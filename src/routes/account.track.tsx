import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { z } from "zod";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopAccountTrack } from "@/components/account/DesktopAccountTrack";
import { MobileAccountTrack } from "@/components/account/MobileAccountTrack";

const searchSchema = z.object({ id: fallback(z.string(), "").default("") });

export const Route = createFileRoute("/account/track")({
  head: () => ({
    meta: [
      { title: "Track Order - ASL ORIGINALS" },
      { name: "description", content: "Track the progress of your ASL ORIGINALS orders and concierge requests in real time." },
      { property: "og:title", content: "Track Order - ASL ORIGINALS" },
      { property: "og:description", content: "Real-time tracking for your ASL ORIGINALS orders." },
       { property: "og:type", content: "website" },
       { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: zodValidator(searchSchema),
  component: TrackPage,
});

function TrackPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopAccountTrack /> : <MobileAccountTrack />}
      <Toaster position="top-center" />
    </>
  );
}
