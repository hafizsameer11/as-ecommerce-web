import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopOrders } from "@/components/account/DesktopOrders";
import { MobileOrders } from "@/components/account/MobileOrders";

export const Route = createFileRoute("/account/orders/")({
  head: () => ({
    meta: [
      { title: "My Orders - ASL ORIGINALS" },
      { name: "description", content: "View your ASL ORIGINALS orders and request history." },
      { property: "og:title", content: "My Orders - ASL ORIGINALS" },
      { property: "og:description", content: "View your orders and request history." },
    ],
  }),
  component: OrdersPage,
});

function OrdersPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopOrders /> : <MobileOrders />}
      <Toaster position="top-center" />
    </>
  );
}
