import { createFileRoute } from "@tanstack/react-router";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { CustomerCareCmsBody } from "@/components/customer-care/CustomerCareCmsBody";
import { useStorePage } from "@/lib/cms-page";

export const Route = createFileRoute("/customer-care/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy - ASL ORIGINALS" },
      { name: "description", content: "ASL ORIGINALS shipping policy: delivery times, processing, fees, delays and order tracking." },
    ],
  }),
  component: ShippingPolicy,
});

function ShippingPolicy() {
  const { page } = useStorePage("customer-care/shipping-policy");
  return (
    <CustomerCareScaffold
      activeId="shipping-policy"
      title={page?.title ?? "Shipping Policy"}
      subtitle={page?.subtitle ?? "We are committed to getting your order to you quickly and securely."}
    >
      <CustomerCareCmsBody slug="customer-care/shipping-policy" />
    </CustomerCareScaffold>
  );
}
