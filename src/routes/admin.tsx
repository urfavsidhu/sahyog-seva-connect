import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireRole("admin"),
  component: () => <Outlet />,
});
