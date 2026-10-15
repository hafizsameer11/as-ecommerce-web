import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopNotifications } from "@/components/account/DesktopNotifications";
import { MobileNotifications } from "@/components/account/MobileNotifications";

export const Route = createFileRoute("/account/notifications/")({
  head: () => ({
    meta: [
      { title: "Notifications - ASL ORIGINALS" },
      { name: "description", content: "Your ASL ORIGINALS order updates, offers, and account notifications." },
      { property: "og:title", content: "Notifications - ASL ORIGINALS" },
      { property: "og:description", content: "Order updates, offers, and account notifications." },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopNotifications /> : <MobileNotifications />}
      <Toaster position="top-center" />
    </>
  );
}
