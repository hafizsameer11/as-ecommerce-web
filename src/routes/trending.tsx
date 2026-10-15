import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DesktopTrending } from "@/components/trending/DesktopTrending";
import { MobileTrending } from "@/components/trending/MobileTrending";

export const Route = createFileRoute("/trending")({
  head: () => ({
    meta: [
      { title: "Trending Now - ASL ORIGINALS" },
      { name: "description", content: "See what's hot right now. The styles everyone's loving." },
      { property: "og:title", content: "Trending Now - ASL ORIGINALS" },
      { property: "og:description", content: "See what's hot right now. The styles everyone's loving." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrendingPage,
});

function TrendingPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile ? <MobileTrending /> : <DesktopTrending />;
}
