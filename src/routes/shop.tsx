import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Shop - ASL ORIGINALS" },
      { name: "description", content: "Browse categories, best sellers, trending now, and brands at ASL ORIGINALS." },
      { property: "og:title", content: "Shop - ASL ORIGINALS" },
      { property: "og:description", content: "Browse categories, best sellers, trending now, and brands at ASL ORIGINALS." },
    ],
  }),
  component: ShopLayout,
});

function ShopLayout() {
  return <Outlet />;
}
