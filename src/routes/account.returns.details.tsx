import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReturnsInnerPage } from "@/components/account/ReturnsInnerPage";
import { moreDetailsItems } from "@/components/account/returnsInnerData";

export const Route = createFileRoute("/account/returns/details")({
  head: () => ({
    meta: [
      { title: "Returns - More Details - ASL ORIGINALS" },
      { name: "description", content: "Detailed information on returns, shipping, exchanges, and support at ASL ORIGINALS." },
      { property: "og:title", content: "Returns - More Details - ASL ORIGINALS" },
      { property: "og:description", content: "Who can return, return shipping, damaged items, exchanges, and support." },
    ],
  }),
  component: () => (
    <>
      <ReturnsInnerPage
        title="More Details"
        items={moreDetailsItems}
        footer="contact"
      />
      <Toaster position="top-center" />
    </>
  ),
});
