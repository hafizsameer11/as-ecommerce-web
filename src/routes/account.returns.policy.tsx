import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReturnsInnerPage } from "@/components/account/ReturnsInnerPage";
import { policyItems } from "@/components/account/returnsInnerData";

export const Route = createFileRoute("/account/returns/policy")({
  head: () => ({
    meta: [
      { title: "Return Policy - ASL ORIGINALS" },
      { name: "description", content: "Read our full return and refund policy at ASL ORIGINALS." },
      { property: "og:title", content: "Return Policy - ASL ORIGINALS" },
      { property: "og:description", content: "Return window, item condition, refund time, and more." },
    ],
  }),
  component: () => (
    <>
      <ReturnsInnerPage
        pageTitle="Return Policy"
        title="Our Return & Return Policy"
        intro="We want you to be completely satisfied with your purchase."
        items={policyItems}
        footer="policy"
      />
      <Toaster position="top-center" />
    </>
  ),
});
