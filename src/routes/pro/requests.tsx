import { createFileRoute } from "@tanstack/react-router";
import { Check, Clock, Inbox, MapPin, Wallet, X, Zap } from "lucide-react";
import { useState } from "react";
import { getIncomingRequests, updateBookingStatus } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  inr,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/pro/requests")({
  head: () => ({ meta: [{ title: "Requests — SahyogSeva Pro" }] }),
  component: RequestsPage,
});

function RequestsPage() {
  const requests = useAsync(getIncomingRequests);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function respond(id: string, accept: boolean) {
    setBusyId(id);
    try {
      await updateBookingStatus(id, accept ? "confirmed" : "cancelled");
      requests.setData((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Incoming requests"
        subtitle={`${requests.data?.length ?? 0} waiting for your response`}
      />

      {requests.loading ? (
        <Loading label="Loading requests…" />
      ) : requests.error ? (
        <ErrorState message={requests.error} onRetry={requests.retry} />
      ) : !requests.data?.length ? (
        <EmptyState icon={Inbox} title="No pending requests" body="New job requests will appear here." />
      ) : (
        <div className="space-y-3">
          {requests.data.map((r) => (
            <Card key={r.id} className={r.urgent ? "border-urgent/30 bg-urgent-soft" : undefined}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {r.customerName}
                    {r.urgent && (
                      <span className="flex items-center gap-0.5 text-xs font-semibold text-urgent">
                        <Zap className="h-3.5 w-3.5" /> Urgent
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.service}</p>
                </div>
                <p className="shrink-0 text-lg font-extrabold">{inr(r.price)}</p>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" /> {r.date} · {r.slot}
                </p>
                <p className="flex items-start gap-1.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {r.address}
                </p>
                <p className="flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 shrink-0" />
                  {r.payment === "online" ? "Paid online" : "Cash on completion"}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  full
                  disabled={busyId === r.id}
                  onClick={() => respond(r.id, false)}
                >
                  <X className="h-4 w-4" /> Decline
                </Button>
                <Button full disabled={busyId === r.id} onClick={() => respond(r.id, true)}>
                  <Check className="h-4 w-4" /> {busyId === r.id ? "Please wait…" : "Accept"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
