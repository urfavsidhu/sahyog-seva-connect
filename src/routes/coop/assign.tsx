import { createFileRoute } from "@tanstack/react-router";
import { Clock, Inbox, MapPin, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { getIncomingRequests, getMembers } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  Stars,
  inr,
  useAsync,
} from "@/components/kit";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

export const Route = createFileRoute("/coop/assign")({
  head: () => ({ meta: [{ title: "Assign jobs — SahyogSeva Cooperative" }] }),
  component: AssignPage,
});

function bestMatches(service: string, members: Member[]) {
  const keyword = service.split(" — ")[0]?.toLowerCase() ?? "";
  return [...members]
    .filter((m) => m.status === "active")
    .sort((a, b) => {
      const aMatch = a.role.toLowerCase().includes(keyword) ? 1 : 0;
      const bMatch = b.role.toLowerCase().includes(keyword) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;
      return b.rating - a.rating;
    })
    .slice(0, 3);
}

function AssignPage() {
  const requests = useAsync(getIncomingRequests);
  const members = useAsync(getMembers);
  const [assigned, setAssigned] = useState<Record<string, string>>({});

  if (requests.loading || members.loading) return <Loading label="Loading job queue…" />;
  if (requests.error) return <ErrorState message={requests.error} onRetry={requests.retry} />;
  if (members.error) return <ErrorState message={members.error} onRetry={members.retry} />;

  const jobs = requests.data ?? [];
  const memberList = members.data ?? [];

  return (
    <div>
      <PageHeader title="Assign jobs" subtitle="Incoming requests for the cooperative" />

      {jobs.length === 0 ? (
        <EmptyState icon={Inbox} title="No jobs to assign" body="New requests will appear here." />
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => {
            const matches = bestMatches(j.service, memberList);
            const chosen = assigned[j.id];
            return (
              <Card key={j.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold">
                      {j.service}
                      {j.urgent && (
                        <span className="flex items-center gap-0.5 text-xs font-semibold text-urgent">
                          <Zap className="h-3.5 w-3.5" /> Urgent
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{j.customerName}</p>
                  </div>
                  <p className="shrink-0 font-bold">{inr(j.price)}</p>
                </div>

                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {j.date} · {j.slot}
                  </p>
                  <p className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {j.address}
                  </p>
                </div>

                <p className="mt-3 mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-accent" /> Suggested members
                </p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {matches.map((m, i) => (
                    <button
                      key={m.id}
                      onClick={() => setAssigned((a) => ({ ...a, [j.id]: m.id }))}
                      className={cn(
                        "tap tap-active flex items-center gap-2 rounded-xl border p-2.5 text-left",
                        chosen === m.id
                          ? "border-primary bg-primary-soft"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      <img src={m.photo} alt={m.name} className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {m.name} {i === 0 && <span className="text-primary">· best match</span>}
                        </p>
                        <Stars value={m.rating} size={10} />
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  size="sm"
                  full
                  className="mt-3"
                  disabled={!chosen}
                  onClick={() => requests.setData((prev) => prev?.filter((r) => r.id !== j.id) ?? prev)}
                >
                  {chosen ? `Assign to ${memberList.find((m) => m.id === chosen)?.name.split(" ")[0]}` : "Pick a member"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
