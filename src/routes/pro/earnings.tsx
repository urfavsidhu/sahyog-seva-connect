import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, IndianRupee, TrendingUp } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getCurrentWorker, getTransactions, getWorkerEarnings } from "@/api/services";
import {
  Card,
  DataTable,
  ErrorState,
  Loading,
  PageHeader,
  Section,
  StatCard,
  inr,
  useAsync,
} from "@/components/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pro/earnings")({
  head: () => ({ meta: [{ title: "Earnings — SahyogSeva Pro" }] }),
  component: EarningsPage,
});

function EarningsPage() {
  const worker = useAsync(getCurrentWorker);
  const earnings = useAsync(getWorkerEarnings);
  const transactions = useAsync(getTransactions);
  const [range, setRange] = useState<"week" | "month">("week");

  if (worker.loading || earnings.loading) return <Loading label="Loading earnings…" />;
  if (worker.error) return <ErrorState message={worker.error} onRetry={worker.retry} />;
  if (earnings.error) return <ErrorState message={earnings.error} onRetry={earnings.retry} />;

  const w = worker.data;
  const series = earnings.data?.[range] ?? [];
  const totalThisRange = series.reduce((s, r) => s + r.earnings, 0);
  const totalJobs = series.reduce((s, r) => s + r.jobs, 0);
  const myTx = (transactions.data ?? []).filter((t) => t.member === w?.name);

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your income across the cooperative" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={IndianRupee} label="This month" value={inr(w?.earningsThisMonth ?? 0)} tone="success" />
        <StatCard icon={TrendingUp} label={`${range === "week" ? "7-day" : "4-week"} total`} value={inr(totalThisRange)} tone="primary" />
        <StatCard icon={Briefcase} label="Jobs in range" value={String(totalJobs)} tone="accent" />
      </div>

      <Section
        title="Breakdown"
        action={
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(["week", "month"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "tap rounded-lg px-3 py-1.5 text-xs font-semibold capitalize",
                  range === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      >
        <Card>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  formatter={(v: number) => inr(v)}
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="earnings" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section title="Recent transactions">
        {myTx.length === 0 ? (
          <Card className="text-center text-sm text-muted-foreground">No transactions yet.</Card>
        ) : (
          <DataTable head={["Date", "Service", "Amount", "Your share", "Method"]}>
            {myTx.map((t) => (
              <tr key={t.id}>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{t.date}</td>
                <td className="px-4 py-3 font-medium">{t.service}</td>
                <td className="px-4 py-3">{inr(t.amount)}</td>
                <td className="px-4 py-3 font-semibold text-success">{inr(t.workerShare)}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{t.method}</td>
              </tr>
            ))}
          </DataTable>
        )}
      </Section>
    </div>
  );
}
