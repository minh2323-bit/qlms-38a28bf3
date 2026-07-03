import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lop-truc-tuyen")({
  component: () => <Outlet />,
});
