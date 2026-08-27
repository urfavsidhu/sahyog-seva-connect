import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/coop")({
  beforeLoad: requireRole("coop"),
  component: () => <Outlet />,
});
