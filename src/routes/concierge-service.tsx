import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { DesktopCategories } from "@/components/categories/DesktopCategories";
import { MobileCategories } from "@/components/categories/MobileCategories";

export const Route = createFileRoute("/concierge-service")({
  head: () => ({
    meta: [
      { title: "Concierge Service - ASL ORIGINALS" },
      { name: "description", content: "Browse all concierge categories - sneakers, luxury fashion, watches, bags, eyewear and more sourced by ASL ORIGINALS." },
      { property: "og:title", content: "Concierge Service - ASL ORIGINALS" },
      { property: "og:description", content: "Browse all concierge categories sourced by ASL ORIGINALS." },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopCategories /> : <MobileCategories />}
      <Toaster position="top-center" />
    </>
  );
}
