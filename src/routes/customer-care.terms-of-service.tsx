import { createFileRoute } from "@tanstack/react-router";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { CustomerCareCmsBody } from "@/components/customer-care/CustomerCareCmsBody";
import { useStorePage } from "@/lib/cms-page";

export const Route = createFileRoute("/customer-care/terms-of-service")({
  head: () => ({
    meta: [
      { title: "Terms of Service - ASL ORIGINALS" },
      { name: "description", content: "Terms and conditions for using ASL ORIGINALS services." },
    ],
  }),
  component: TermsOfService,
});

function TermsOfService() {
  const { page } = useStorePage("customer-care/terms-of-service");
  return (
    <CustomerCareScaffold
      activeId="terms-of-service"
      title={page?.title ?? "Terms of Service"}
      subtitle={page?.subtitle ?? "Please read these terms carefully."}
    >
      <CustomerCareCmsBody slug="customer-care/terms-of-service" />
    </CustomerCareScaffold>
  );
}
