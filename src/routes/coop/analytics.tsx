import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCoopAnalytics } from "@/api/services";
import { Card, ErrorState, Loading, PageHeader, Section, inr, useAsync } from "@/components/kit";

export const Route = createFileRoute("/coop/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SahyogSeva Cooperative" }] }),
  component: CoopAnalyticsPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

function CoopAnalyticsPage() {
  const analytics = useAsync(getCoopAnalytics);

  if (analytics.loading) return <Loading label="Loading analytics…" />;
  if (analytics.error) return <ErrorState message={analytics.error} onRetry={analytics.retry} />;

  const jobsOverTime = analytics.data?.jobsOverTime ?? [];
  const categoryBreakdown = analytics.data?.categoryBreakdown ?? [];

  return (
    <div>
      <PageHeader title="Cooperative analytics" subtitle="Jobs, revenue and category trends" />

      <Section title="Jobs & revenue over time">
        <Card>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={jobsOverTime} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="coopRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  formatter={(v: number, name: string) => (name === "revenue" ? inr(v) : v)}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-chart-1)" fill="url(#coopRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section title="Service category breakdown">
        <Card className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="h-56 w-full sm:w-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {categoryBreakdown.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  {c.name}
                </span>
                <span className="font-semibold">{c.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>
    </div>
  );
}
