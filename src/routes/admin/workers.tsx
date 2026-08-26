import { createFileRoute } from "@tanstack/react-router";
import { Check, FileText, X } from "lucide-react";
import { getWorkers } from "@/api/services";
import {
  Badge,
  Card,
  ErrorState,
  Loading,
  PageHeader,
  Stars,
  inr,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/admin/workers")({
  head: () => ({ meta: [{ title: "Workers — SahyogSeva Admin" }] }),
  component: AdminWorkersPage,
});

function AdminWorkersPage() {
  const workers = useAsync(getWorkers);

  if (workers.loading) return <Loading label="Loading workers…" />;
  if (workers.error) return <ErrorState message={workers.error} onRetry={workers.retry} />;

  function setDocStatus(workerId: string, docName: string, status: "verified" | "rejected") {
    workers.setData((prev) =>
      prev
        ? prev.map((w) =>
            w.id === workerId
              ? { ...w, documents: w.documents.map((d) => (d.name === docName ? { ...d, status } : d)) }
              : w,
          )
        : prev,
    );
  }

  const list = workers.data ?? [];

  return (
    <div>
      <PageHeader title="Workers" subtitle={`${list.length} registered workers across all cooperatives`} />

      <div className="grid gap-3 lg:grid-cols-2">
        {list.map((w) => (
          <Card key={w.id} className="flex gap-3">
            <img src={w.photo} alt={w.name} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{w.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {w.category} · {w.cooperative}
                  </p>
                </div>
                <Badge tone={w.status === "active" ? "success" : w.status === "pending" ? "warning" : "danger"}>
                  {w.status}
                </Badge>
              </div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                <Stars value={w.rating} size={12} />
                <span>{inr(w.pricePerHour)}/hr</span>
              </div>

              <div className="mt-3 space-y-1.5">
                {w.documents.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between rounded-lg bg-secondary px-2.5 py-1.5 text-xs"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" /> {d.name}
                    </span>
                    {d.status === "pending" ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDocStatus(w.id, d.name, "verified")}
                          className="tap tap-active rounded-md bg-success-soft p-1 text-success"
                          aria-label={`Approve ${d.name}`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDocStatus(w.id, d.name, "rejected")}
                          className="tap tap-active rounded-md bg-destructive/10 p-1 text-destructive"
                          aria-label={`Reject ${d.name}`}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <Badge tone={d.status === "verified" ? "success" : "danger"}>{d.status}</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
