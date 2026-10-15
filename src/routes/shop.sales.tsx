import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopSales } from "@/components/sales/DesktopSales";
import { MobileSales } from "@/components/sales/MobileSales";

export const Route = createFileRoute("/shop/sales")({
  head: () => ({
    meta: [
      { title: "Sales - Up to 50% Off | ASL ORIGINALS" },
      { name: "description", content: "Big styles. Better prices. Enjoy up to 50% off on your favorite luxury pieces at ASL ORIGINALS." },
      { property: "og:title", content: "Sales - Up to 50% Off | ASL ORIGINALS" },
      { property: "og:description", content: "Big styles. Better prices. Enjoy up to 50% off on your favorite luxury pieces." },
    ],
  }),
  component: SalesPage,
});

function SalesPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopSales /> : <MobileSales />}
      <Toaster position="top-center" />
    </>
  );
}
