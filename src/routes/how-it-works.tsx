import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopHowItWorks } from "@/components/how-it-works/DesktopHowItWorks";
import { MobileHowItWorks } from "@/components/how-it-works/MobileHowItWorks";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works - ASL ORIGINALS Concierge" },
      { name: "description", content: "Simple. Personal. Premium. Learn how the ASL ORIGINALS fashion concierge sources exclusive, limited and sold-out pieces for you in six steps." },
      { property: "og:title", content: "How It Works - ASL ORIGINALS Concierge" },
      { property: "og:description", content: "Six-step concierge process: submit, review, source, price, secure and deliver." },
    ],
  }),
  component: HowItWorksPage,
});

function HowItWorksPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopHowItWorks /> : <MobileHowItWorks />}
      <Toaster position="top-center" />
    </>
  );
}
