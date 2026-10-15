import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/account/help")({
  component: () => <Outlet />,
});
