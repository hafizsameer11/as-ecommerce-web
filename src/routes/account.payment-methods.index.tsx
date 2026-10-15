import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopPaymentMethods } from "@/components/account/DesktopPaymentMethods";
import { MobilePaymentMethods } from "@/components/account/MobilePaymentMethods";

export const Route = createFileRoute("/account/payment-methods/")({
  head: () => ({
    meta: [
      { title: "Payment Methods - ASL ORIGINALS" },
      { name: "description", content: "Manage your saved cards and payment options on ASL ORIGINALS." },
      { property: "og:title", content: "Payment Methods - ASL ORIGINALS" },
      { property: "og:description", content: "Manage saved cards and payment options." },
    ],
  }),
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopPaymentMethods /> : <MobilePaymentMethods />}
      <Toaster position="top-center" />
    </>
  );
}
