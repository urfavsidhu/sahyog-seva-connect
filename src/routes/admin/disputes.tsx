import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { getDisputes } from "@/api/services";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  useAsync,
} from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/disputes")({
  head: () => ({ meta: [{ title: "Disputes — SahyogSeva Admin" }] }),
  component: DisputesPage,
});

function DisputesPage() {
  const disputes = useAsync(getDisputes);

  if (disputes.loading) return <Loading label="Loading disputes…" />;
  if (disputes.error) return <ErrorState message={disputes.error} onRetry={disputes.retry} />;

  function advance(id: string) {
    disputes.setData((prev) =>
      prev
        ? prev.map((d) =>
            d.id === id
              ? { ...d, status: d.status === "open" ? "investigating" : "resolved" }
              : d,
          )
        : prev,
    );
  }

  const list = disputes.data ?? [];

  if (list.length === 0) {
    return (
      <div>
        <PageHeader title="Disputes" subtitle="Raised complaints between customers and workers" />
        <EmptyState icon={CheckCircle2} title="No open disputes" body="All disputes have been resolved." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Disputes" subtitle={`${list.length} raised complaints`} />

      <div className="space-y-3">
        {list.map((d) => (
          <Card key={d.id} className={cn(d.status === "open" && "border-destructive/30 bg-destructive/5")}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-semibold">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-destructive" />
                  {d.raisedBy} vs {d.against}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Booking {d.booking} · {d.date}</p>
              </div>
              <Badge tone={d.status === "resolved" ? "success" : d.status === "investigating" ? "primary" : "danger"}>
                {d.status}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{d.issue}</p>
            {d.status !== "resolved" && (
              <button
                onClick={() => advance(d.id)}
                className="tap tap-active mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Search className="h-3.5 w-3.5" />
                {d.status === "open" ? "Start investigating" : "Mark resolved"}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
