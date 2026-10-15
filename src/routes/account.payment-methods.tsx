import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/account/payment-methods")({
  component: () => <Outlet />,
});
