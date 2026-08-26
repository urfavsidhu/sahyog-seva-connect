import { createFileRoute } from "@tanstack/react-router";
import { Search, ShieldBan, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { getUsers } from "@/api/services";
import {
  Badge,
  DataTable,
  ErrorState,
  Loading,
  PageHeader,
  useAsync,
} from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — SahyogSeva Admin" }] }),
  component: UsersPage,
});

const ROLES = ["all", "customer", "worker", "coop", "admin"] as const;

function UsersPage() {
  const users = useAsync(getUsers);
  const [q, setQ] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("all");

  if (users.loading) return <Loading label="Loading users…" />;
  if (users.error) return <ErrorState message={users.error} onRetry={users.retry} />;

  const list = (users.data ?? []).filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())),
  );

  function toggleSuspend(id: string) {
    users.setData((prev) =>
      prev
        ? prev.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u))
        : prev,
    );
  }

  return (
    <div>
      <PageHeader title="Users" subtitle={`${users.data?.length ?? 0} accounts across the platform`} />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="surface flex flex-1 items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or email"
            className="h-11 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                "tap whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold capitalize",
                role === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <DataTable head={["Name", "Email", "City", "Role", "Bookings", "Status", "Action"]}>
        {list.map((u) => (
          <tr key={u.id}>
            <td className="whitespace-nowrap px-4 py-3 font-medium">{u.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
            <td className="px-4 py-3 text-muted-foreground">{u.city}</td>
            <td className="px-4 py-3 capitalize text-muted-foreground">{u.role}</td>
            <td className="px-4 py-3">{u.bookings}</td>
            <td className="px-4 py-3">
              <Badge tone={u.status === "active" ? "success" : "danger"}>{u.status}</Badge>
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => toggleSuspend(u.id)}
                className="tap tap-active flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                {u.status === "active" ? (
                  <>
                    <ShieldBan className="h-3.5 w-3.5" /> Suspend
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" /> Reactivate
                  </>
                )}
              </button>
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
