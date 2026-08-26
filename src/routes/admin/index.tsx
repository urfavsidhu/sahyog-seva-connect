import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, IndianRupee, ListChecks, Store, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getBookings, getCooperatives, getPlatformAnalytics, getUsers, getWorkers } from "@/api/services";
import { Card, ErrorState, Loading, PageHeader, Section, StatCard, inr, useAsync } from "@/components/kit";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — SahyogSeva" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const users = useAsync(getUsers);
  const workers = useAsync(getWorkers);
  const coops = useAsync(getCooperatives);
  const bookings = useAsync(getBookings);
  const analytics = useAsync(getPlatformAnalytics);

  const loading = users.loading || workers.loading || coops.loading || bookings.loading || analytics.loading;
  const err = users.error || workers.error || coops.error || bookings.error || analytics.error;

  if (loading) return <Loading label="Loading platform overview…" />;
  if (err) return <ErrorState message={err} onRetry={() => [users, workers, coops, bookings, analytics].forEach((q) => q.retry())} />;

  const trend = analytics.data?.trend ?? [];
  const latestRevenue = trend[trend.length - 1]?.revenue ?? 0;

  return (
    <div>
      <PageHeader title="Platform overview" subtitle="SahyogSeva — all cooperatives, all cities" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={Users} label="Total users" value={String(users.data?.length ?? 0)} tone="primary" />
        <StatCard icon={Briefcase} label="Workers" value={String(workers.data?.length ?? 0)} tone="accent" />
        <StatCard icon={Store} label="Cooperatives" value={String(coops.data?.length ?? 0)} tone="success" />
        <StatCard icon={ListChecks} label="Bookings" value={String(bookings.data?.length ?? 0)} tone="urgent" />
        <StatCard icon={IndianRupee} label="Monthly revenue" value={inr(latestRevenue)} tone="primary" />
      </div>

      <Section title="Platform growth">
        <Card>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="users" stroke="var(--color-chart-1)" fill="url(#usersFill)" strokeWidth={2} />
                <Area type="monotone" dataKey="bookings" stroke="var(--color-chart-2)" fill="url(#bookingsFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>
    </div>
  );
}
