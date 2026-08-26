import { createFileRoute } from "@tanstack/react-router";
import { Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { getMembers } from "@/api/services";
import {
  Badge,
  Button,
  Card,
  ErrorState,
  Loading,
  PageHeader,
  Stars,
  inr,
  useAsync,
} from "@/components/kit";
import type { Member } from "@/lib/types";

export const Route = createFileRoute("/coop/members")({
  head: () => ({ meta: [{ title: "Members — SahyogSeva Cooperative" }] }),
  component: MembersPage,
});

function MembersPage() {
  const members = useAsync(getMembers);
  const [removing, setRemoving] = useState<string | null>(null);

  function remove(id: string) {
    setRemoving(id);
    setTimeout(() => {
      members.setData((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
      setRemoving(null);
    }, 400);
  }

  if (members.loading) return <Loading label="Loading members…" />;
  if (members.error) return <ErrorState message={members.error} onRetry={members.retry} />;

  const list = members.data ?? [];

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${list.length} worker-owners in this cooperative`}
        action={
          <Button size="sm">
            <UserPlus className="h-4 w-4" /> Add member
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((m: Member) => (
          <Card key={m.id} className="flex gap-3">
            <img src={m.photo} alt={m.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                </div>
                <Badge tone={m.status === "active" ? "success" : "neutral"}>{m.status}</Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Stars value={m.rating} size={12} />
                <span>{m.jobs} jobs</span>
              </div>
              <p className="mt-1 text-xs font-semibold text-success">
                {inr(m.earnings)} · {m.share}% share
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">Joined {m.joined}</p>
              <button
                onClick={() => remove(m.id)}
                disabled={removing === m.id}
                className="tap tap-active mt-3 flex items-center gap-1.5 text-xs font-semibold text-destructive hover:underline"
              >
                <Trash2 className="h-3.5 w-3.5" /> {removing === m.id ? "Removing…" : "Remove"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
