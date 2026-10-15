import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { DesktopBestSellers } from "@/components/best-sellers/DesktopBestSellers";
import { MobileBestSellers } from "@/components/best-sellers/MobileBestSellers";

export const Route = createFileRoute("/best-sellers")({
  head: () => ({
    meta: [
      { title: "Best Sellers - ASL ORIGINALS" },
      { name: "description", content: "Shop our most loved pieces. Handpicked by you." },
      { property: "og:title", content: "Best Sellers - ASL ORIGINALS" },
      { property: "og:description", content: "Shop our most loved pieces. Handpicked by you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BestSellersPage,
});

function BestSellersPage() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile ? <MobileBestSellers /> : <DesktopBestSellers />;
}
