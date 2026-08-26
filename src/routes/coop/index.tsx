import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Briefcase, IndianRupee, Users } from "lucide-react";
import { getCoopAnalytics, getMembers } from "@/api/services";
import {
  Card,
  ErrorState,
  Loading,
  PageHeader,
  Section,
  StatCard,
  Stars,
  inr,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/coop/")({
  head: () => ({ meta: [{ title: "Cooperative dashboard — SahyogSeva" }] }),
  component: CoopOverview,
});

function CoopOverview() {
  const members = useAsync(getMembers);
  const analytics = useAsync(getCoopAnalytics);

  if (members.loading || analytics.loading) return <Loading label="Loading cooperative data…" />;
  if (members.error) return <ErrorState message={members.error} onRetry={members.retry} />;
  if (analytics.error) return <ErrorState message={analytics.error} onRetry={analytics.retry} />;

  const list = members.data ?? [];
  const totalJobs = list.reduce((s, m) => s + m.jobs, 0);
  const totalEarnings = list.reduce((s, m) => s + m.earnings, 0);
  const top = [...list].sort((a, b) => b.earnings - a.earnings)[0];

  return (
    <div>
      <PageHeader title="Nagar Sahyog Cooperative" subtitle="Overview for this month" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Users} label="Members" value={String(list.length)} tone="primary" />
        <StatCard icon={Briefcase} label="Jobs this month" value={String(totalJobs)} tone="accent" />
        <StatCard icon={IndianRupee} label="Collective earnings" value={inr(totalEarnings)} tone="success" />
        <StatCard icon={Award} label="Top performer" value={top?.name.split(" ")[0] ?? "—"} tone="urgent" />
      </div>

      {top && (
        <Section title="Top performer this month">
          <Card className="flex items-center gap-3">
            <img src={top.photo} alt={top.name} className="h-14 w-14 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{top.name}</p>
              <p className="text-xs text-muted-foreground">
                {top.role} · {top.jobs} jobs · {inr(top.earnings)}
              </p>
              <Stars value={top.rating} size={13} />
            </div>
          </Card>
        </Section>
      )}

      <Section title="Jobs over time">
        <Card>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.data?.jobsOverTime ?? []} margin={{ left: -20, right: 8, top: 8 }}>
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
                <Bar dataKey="jobs" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section title="Quick links">
        <div className="grid gap-3 sm:grid-cols-3">
          <Link to="/coop/members">
            <Card interactive className="text-center">
              <p className="font-semibold">Members</p>
              <p className="mt-1 text-xs text-muted-foreground">Manage roster</p>
            </Card>
          </Link>
          <Link to="/coop/assign">
            <Card interactive className="text-center">
              <p className="font-semibold">Assign jobs</p>
              <p className="mt-1 text-xs text-muted-foreground">Match new requests</p>
            </Card>
          </Link>
          <Link to="/coop/revenue">
            <Card interactive className="text-center">
              <p className="font-semibold">Revenue split</p>
              <p className="mt-1 text-xs text-muted-foreground">Transparent payouts</p>
            </Card>
          </Link>
        </div>
      </Section>
    </div>
  );
}
