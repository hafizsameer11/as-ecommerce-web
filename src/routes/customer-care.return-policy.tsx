import { createFileRoute } from "@tanstack/react-router";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { CustomerCareCmsBody } from "@/components/customer-care/CustomerCareCmsBody";
import { useStorePage } from "@/lib/cms-page";

export const Route = createFileRoute("/customer-care/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy - ASL ORIGINALS" },
      { name: "description", content: "ASL ORIGINALS return policy and eligibility." },
    ],
  }),
  component: ReturnPolicy,
});

function ReturnPolicy() {
  const { page } = useStorePage("customer-care/return-policy");
  return (
    <CustomerCareScaffold
      activeId="return-policy"
      title={page?.title ?? "Return Policy"}
      subtitle={page?.subtitle ?? "How returns work at ASL ORIGINALS."}
    >
      <CustomerCareCmsBody slug="customer-care/return-policy" />
    </CustomerCareScaffold>
  );
}
