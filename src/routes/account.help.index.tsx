import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopHelp } from "@/components/account/DesktopHelp";
import { MobileHelp } from "@/components/account/MobileHelp";

export const Route = createFileRoute("/account/help/")({
  head: () => ({
    meta: [
      { title: "Help & Support - ASL ORIGINALS" },
      { name: "description", content: "Get help and support from the ASL ORIGINALS team." },
      { property: "og:title", content: "Help & Support - ASL ORIGINALS" },
      { property: "og:description", content: "Get help and support from the ASL ORIGINALS team." },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopHelp /> : <MobileHelp />}
      <Toaster position="top-center" />
    </>
  );
}
