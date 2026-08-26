import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  MapPin,
  Star,
  Zap,
} from "lucide-react";
import { getCurrentWorker, getWorkerBookings } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  Section,
  StatCard,
  StatusBadge,
  inr,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/pro/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SahyogSeva Pro" }] }),
  component: WorkerDashboard,
});

const todayIso = () => new Date().toISOString().slice(0, 10);

function WorkerDashboard() {
  const worker = useAsync(getCurrentWorker);
  const bookings = useAsync(getWorkerBookings);

  const w = worker.data;
  const jobs = bookings.data ?? [];
  const todaysJobs = jobs.filter(
    (b) => b.date === todayIso() && b.status !== "cancelled" && b.status !== "completed",
  );
  const activeJob = jobs.find((b) => b.status === "in-progress");

  if (worker.loading || bookings.loading) return <Loading label="Loading dashboard…" />;
  if (worker.error) return <ErrorState message={worker.error} onRetry={worker.retry} />;
  if (!w) return <ErrorState message="Worker profile not found." />;

  return (
    <div>
      <PageHeader
        title={`Namaste, ${w.name.split(" ")[0]}`}
        subtitle={w.cooperative}
        action={
          <span className="flex items-center gap-1 text-sm font-semibold text-success">
            <span className="h-2 w-2 rounded-full bg-success" /> Online
          </span>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={IndianRupee}
          label="Earnings this month"
          value={inr(w.earningsThisMonth)}
          tone="success"
        />
        <StatCard icon={Star} label="Rating" value={w.rating.toFixed(1)} tone="accent" />
        <StatCard
          icon={CheckCircle2}
          label="Jobs completed"
          value={String(w.jobsCompleted)}
          tone="primary"
        />
        <StatCard icon={Briefcase} label="Today's jobs" value={String(todaysJobs.length)} tone="urgent" />
      </div>

      {activeJob && (
        <Section title="Active job">
          <Card className="border-primary/30 bg-primary-soft">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold">{activeJob.customerName}</p>
                <p className="text-xs text-muted-foreground">{activeJob.service}</p>
              </div>
              <StatusBadge status={activeJob.status} />
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {activeJob.address}
            </p>
            <Link to="/pro/requests" className="mt-3 block">
              <Button size="sm" full>
                View job details
              </Button>
            </Link>
          </Card>
        </Section>
      )}

      <Section title="Today's schedule">
        {todaysJobs.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No jobs today"
            body="New requests will show up on your Requests tab."
            action={
              <Link to="/pro/requests">
                <Button variant="outline">View requests</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {todaysJobs.map((b) => (
              <Card key={b.id} className="flex items-center gap-3">
                <img
                  src={b.workerPhoto}
                  alt=""
                  className="hidden h-12 w-12 shrink-0 rounded-xl object-cover object-top sm:block"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.customerName}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.service}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {b.slot}
                    {b.urgent && (
                      <span className="ml-1 flex items-center gap-0.5 font-semibold text-urgent">
                        <Zap className="h-3 w-3" /> Urgent
                      </span>
                    )}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </Card>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
