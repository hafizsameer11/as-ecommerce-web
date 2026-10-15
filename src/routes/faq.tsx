import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopFAQ } from "@/components/faq/DesktopFAQ";
import { MobileFAQ } from "@/components/faq/MobileFAQ";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ - ASL ORIGINALS Concierge" },
      { name: "description", content: "Answers to common questions about the ASL ORIGINALS Fashion Concierge - requests, payment, shipping, returns and support." },
      { property: "og:title", content: "FAQ - ASL ORIGINALS" },
      { property: "og:description", content: "Everything you need to know about the ASL ORIGINALS Fashion Concierge service." },
      { property: "og:url", content: "/faq" },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: FAQPage,
});

function FAQPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopFAQ /> : <MobileFAQ />}
      <Toaster position="top-center" />
    </>
  );
}
