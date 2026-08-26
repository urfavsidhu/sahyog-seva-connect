import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Clock, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { getWorkerBookings } from "@/api/services";
import { Card, ErrorState, Loading, PageHeader, Section, StatusBadge, useAsync } from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/calendar")({
  head: () => ({ meta: [{ title: "Calendar — SahyogSeva Pro" }] }),
  component: CalendarPage,
});

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startOffset }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);
const todayIso = iso(new Date());

function CalendarPage() {
  const bookings = useAsync(getWorkerBookings);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return { year: n.getFullYear(), month: n.getMonth() };
  });
  const [selected, setSelected] = useState<string>(todayIso);

  const cells = useMemo(() => buildMonth(cursor.year, cursor.month), [cursor]);
  const jobs = bookings.data ?? [];
  const jobsByDate = useMemo(() => {
    const m: Record<string, typeof jobs> = {};
    for (const j of jobs) {
      if (j.status === "cancelled") continue;
      (m[j.date] ??= []).push(j);
    }
    return m;
  }, [jobs]);

  if (bookings.loading) return <Loading label="Loading calendar…" />;
  if (bookings.error) return <ErrorState message={bookings.error} onRetry={bookings.retry} />;

  const monthLabel = new Date(cursor.year, cursor.month).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const selectedJobs = jobsByDate[selected] ?? [];

  return (
    <div>
      <PageHeader title="Work calendar" subtitle="Your booked slots and availability" />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <button
            className="tap tap-active rounded-lg p-2 hover:bg-secondary"
            onClick={() =>
              setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))
            }
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="font-semibold">{monthLabel}</p>
          <button
            className="tap tap-active rounded-lg p-2 hover:bg-secondary"
            onClick={() =>
              setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))
            }
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={i} />;
            const key = iso(d);
            const count = jobsByDate[key]?.length ?? 0;
            const hasUrgent = jobsByDate[key]?.some((j) => j.urgent);
            return (
              <button
                key={i}
                onClick={() => setSelected(key)}
                className={cn(
                  "tap tap-active relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm font-semibold",
                  selected === key
                    ? "bg-primary text-primary-foreground"
                    : key === todayIso
                      ? "bg-primary-soft text-primary"
                      : "text-foreground hover:bg-secondary",
                )}
              >
                {d.getDate()}
                {count > 0 && (
                  <span
                    className={cn(
                      "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                      hasUrgent ? "bg-urgent" : selected === key ? "bg-primary-foreground" : "bg-accent",
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Section title={new Date(selected).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}>
        {selectedJobs.length === 0 ? (
          <Card className="text-center text-sm text-muted-foreground">No jobs booked this day.</Card>
        ) : (
          <div className="space-y-3">
            {selectedJobs.map((j) => (
              <Card key={j.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{j.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{j.service}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {j.slot}
                    {j.urgent && (
                      <span className="ml-1 flex items-center gap-0.5 font-semibold text-urgent">
                        <Zap className="h-3 w-3" /> Urgent
                      </span>
                    )}
                  </p>
                </div>
                <StatusBadge status={j.status} />
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
