import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/customer-care/")({
  component: () => <Navigate to="/customer-care/shipping-policy" replace />,
});
