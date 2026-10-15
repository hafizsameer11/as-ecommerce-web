import { createFileRoute } from "@tanstack/react-router";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { CustomerCareCmsBody } from "@/components/customer-care/CustomerCareCmsBody";
import { useStorePage } from "@/lib/cms-page";

export const Route = createFileRoute("/customer-care/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy - ASL ORIGINALS" },
      { name: "description", content: "ASL ORIGINALS refund policy and timelines." },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  const { page } = useStorePage("customer-care/refund-policy");
  return (
    <CustomerCareScaffold
      activeId="refund-policy"
      title={page?.title ?? "Refund Policy"}
      subtitle={page?.subtitle ?? "How refunds are processed."}
    >
      <CustomerCareCmsBody slug="customer-care/refund-policy" />
    </CustomerCareScaffold>
  );
}
