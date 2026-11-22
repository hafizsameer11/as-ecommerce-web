import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/shell/MobileShell";
import { DesktopShell } from "@/components/shell/DesktopShell";
import { ComingSoonContent } from "@/components/coming-soon/ComingSoonContent";
import { PUBLIC_SETTINGS_DEFAULTS } from "@/lib/public-settings-format";

const depositPctDefault = PUBLIC_SETTINGS_DEFAULTS.drops.depositPctDefault;

export const Route = createFileRoute("/coming-soon")({
  head: () => ({
    meta: [
      { title: "Coming Soon - Reserve Upcoming Drops | ASL ORIGINALS" },
      {
        name: "description",
        content:
          `Preview upcoming luxury drops and reserve your size with a ${depositPctDefault}% deposit. Balance payable on release day.`,
      },
      { property: "og:title", content: "Coming Soon - Reserve Upcoming Drops | ASL ORIGINALS" },
      {
        property: "og:description",
        content: `Secure upcoming footwear, fashion and fragrance drops with a ${depositPctDefault}% deposit.`,
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile ? (
    <MobileShell
      activeBottom="shop"
      headerVariant="shop"
      showTopTabs={false}
      showSearchInHeader
      onBack={() => window.history.back()}
    >
      <ComingSoonContent compact />
    </MobileShell>
  ) : (
    <DesktopShell active="Coming Soon">
      <ComingSoonContent />
    </DesktopShell>
  );
}
