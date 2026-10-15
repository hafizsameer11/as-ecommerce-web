import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { Toaster } from "sonner";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { MobileSearch } from "@/components/search/MobileSearch";
import { DesktopSearch } from "@/components/search/DesktopSearch";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/search")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Search - ASL ORIGINALS" },
      { name: "description", content: "Search luxury footwear, fashion, accessories and fragrances at ASL ORIGINALS." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const isDesktop = useIsDesktop();
  return (
    <>
      {isDesktop ? <DesktopSearch /> : <MobileSearch />}
      <Toaster position="top-center" />
    </>
  );
}
