import { createFileRoute } from "@tanstack/react-router";
import { CustomerCareScaffold } from "@/components/customer-care/CustomerCareScaffold";
import { CustomerCareCmsBody } from "@/components/customer-care/CustomerCareCmsBody";
import { useStorePage } from "@/lib/cms-page";

export const Route = createFileRoute("/customer-care/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy - ASL ORIGINALS" },
      { name: "description", content: "How ASL ORIGINALS collects, uses, protects, and shares your information." },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  const { page } = useStorePage("customer-care/privacy-policy");
  return (
    <CustomerCareScaffold
      activeId="privacy-policy"
      title={page?.title ?? "Privacy Policy"}
      subtitle={page?.subtitle ?? "Your privacy is important to us."}
    >
      <CustomerCareCmsBody slug="customer-care/privacy-policy" />
    </CustomerCareScaffold>
  );
}
