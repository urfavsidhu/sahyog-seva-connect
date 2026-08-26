import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getBookings } from "@/api/services";
import { DataTable, ErrorState, Loading, PageHeader, StatusBadge, inr, useAsync } from "@/components/kit";
import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — SahyogSeva Admin" }] }),
  component: AdminBookingsPage,
});

const STATUSES: ("all" | BookingStatus)[] = [
  "all",
  "pending",
  "confirmed",
  "in-progress",
  "completed",
  "cancelled",
];

function AdminBookingsPage() {
  const bookings = useAsync(getBookings);
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");

  if (bookings.loading) return <Loading label="Loading bookings…" />;
  if (bookings.error) return <ErrorState message={bookings.error} onRetry={bookings.retry} />;

  const list = (bookings.data ?? []).filter((b) => status === "all" || b.status === status);

  return (
    <div>
      <PageHeader title="Booking monitoring" subtitle={`${bookings.data?.length ?? 0} bookings platform-wide`} />

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl bg-secondary p-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={cn(
              "tap whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold capitalize",
              status === s ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
            )}
          >
            {s.replace("-", " ")}
          </button>
        ))}
      </div>

      <DataTable head={["ID", "Customer", "Worker", "Service", "Date", "Price", "Status"]}>
        {list.map((b) => (
          <tr key={b.id}>
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{b.id}</td>
            <td className="px-4 py-3 font-medium">{b.customerName}</td>
            <td className="px-4 py-3 text-muted-foreground">{b.workerName}</td>
            <td className="px-4 py-3 text-muted-foreground">{b.service}</td>
            <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{b.date}</td>
            <td className="px-4 py-3">{inr(b.price)}</td>
            <td className="px-4 py-3">
              <StatusBadge status={b.status} />
            </td>
          </tr>
        ))}
      </DataTable>
    </div>
  );
}
