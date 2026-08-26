import { createFileRoute } from "@tanstack/react-router";
import { Check, MapPin, X } from "lucide-react";
import { getCooperatives } from "@/api/services";
import { Badge, Button, Card, ErrorState, Loading, PageHeader, inr, useAsync } from "@/components/kit";

export const Route = createFileRoute("/admin/cooperatives")({
  head: () => ({ meta: [{ title: "Cooperatives — SahyogSeva Admin" }] }),
  component: CooperativesPage,
});

function CooperativesPage() {
  const coops = useAsync(getCooperatives);

  if (coops.loading) return <Loading label="Loading cooperatives…" />;
  if (coops.error) return <ErrorState message={coops.error} onRetry={coops.retry} />;

  function decide(id: string, status: "approved" | "rejected") {
    coops.setData((prev) => (prev ? prev.map((c) => (c.id === id ? { ...c, status } : c)) : prev));
  }

  const list = coops.data ?? [];
  const pending = list.filter((c) => c.status === "pending");
  const others = list.filter((c) => c.status !== "pending");

  return (
    <div>
      <PageHeader title="Cooperatives" subtitle={`${list.length} cooperatives registered on the platform`} />

      {pending.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Pending approval</p>
          {pending.map((c) => (
            <Card key={c.id} className="border-warning/40 bg-warning-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {c.city} · {c.members} members
                  </p>
                </div>
                <Badge tone="warning">pending</Badge>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" full onClick={() => decide(c.id, "rejected")}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
                <Button size="sm" full onClick={() => decide(c.id, "approved")}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="mb-3 text-sm font-semibold text-muted-foreground">All cooperatives</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {others.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {c.city}
                </p>
              </div>
              <Badge tone={c.status === "approved" ? "success" : "danger"}>{c.status}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{c.members} members · {c.jobs} jobs</span>
              <span className="font-semibold">{inr(c.revenue)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
