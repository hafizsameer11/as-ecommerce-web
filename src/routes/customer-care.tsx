import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/customer-care")({
  component: () => <Outlet />,
});
