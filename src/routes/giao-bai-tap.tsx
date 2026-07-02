import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/giao-bai-tap")({
  component: () => <Outlet />,
});