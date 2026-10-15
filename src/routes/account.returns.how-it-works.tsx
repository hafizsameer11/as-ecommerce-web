import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { ReturnsInnerPage } from "@/components/account/ReturnsInnerPage";
import { howItWorksSteps } from "@/components/account/returnsInnerData";

export const Route = createFileRoute("/account/returns/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Returns Work - ASL ORIGINALS" },
      { name: "description", content: "See how the ASL ORIGINALS returns process works, step by step." },
      { property: "og:title", content: "How Returns Work - ASL ORIGINALS" },
      { property: "og:description", content: "A simple, hassle-free return process in 6 steps." },
    ],
  }),
  component: () => (
    <>
      <ReturnsInnerPage
        pageTitle="How It Works"
        title="Our Return Process"
        intro="Simple steps to return your item."
        items={howItWorksSteps}
        numbered
        footer="help"
      />
      <Toaster position="top-center" />
    </>
  ),
});
