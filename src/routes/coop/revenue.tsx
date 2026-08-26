import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, IndianRupee, PiggyBank, Wallet } from "lucide-react";
import { getMembers, getTransactions } from "@/api/services";
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

export const Route = createFileRoute("/coop/revenue")({
  head: () => ({ meta: [{ title: "Revenue sharing — SahyogSeva Cooperative" }] }),
  component: RevenuePage,
});

function RevenuePage() {
  const transactions = useAsync(getTransactions);
  const members = useAsync(getMembers);

  if (transactions.loading || members.loading) return <Loading label="Loading revenue data…" />;
  if (transactions.error) return <ErrorState message={transactions.error} onRetry={transactions.retry} />;
  if (members.error) return <ErrorState message={members.error} onRetry={members.retry} />;

  const tx = transactions.data ?? [];
  const totalAmount = tx.reduce((s, t) => s + t.amount, 0);
  const totalWorkerShare = tx.reduce((s, t) => s + t.workerShare, 0);
  const totalCoopShare = tx.reduce((s, t) => s + t.coopShare, 0);

  const perMember = (members.data ?? []).map((m) => {
    const rows = tx.filter((t) => t.member === m.name);
    return {
      ...m,
      txAmount: rows.reduce((s, t) => s + t.amount, 0),
      txWorkerShare: rows.reduce((s, t) => s + t.workerShare, 0),
      txCoopShare: rows.reduce((s, t) => s + t.coopShare, 0),
    };
  });

  return (
    <div>
      <PageHeader title="Revenue sharing" subtitle="How every rupee is split, transparently" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard icon={IndianRupee} label="Total booked" value={inr(totalAmount)} tone="primary" />
        <StatCard icon={Wallet} label="Paid to workers" value={inr(totalWorkerShare)} tone="success" />
        <StatCard icon={PiggyBank} label="Cooperative fund" value={inr(totalCoopShare)} tone="accent" />
      </div>

      <Section title="Example split">
        <Card className="flex flex-wrap items-center justify-center gap-3 text-center sm:justify-between sm:text-left">
          <div>
            <p className="text-xs text-muted-foreground">Job total</p>
            <p className="text-lg font-extrabold">₹500</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Worker (85%)</p>
            <p className="text-lg font-extrabold text-success">₹425</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Cooperative fund (15%)</p>
            <p className="text-lg font-extrabold text-accent-foreground">₹75</p>
          </div>
        </Card>
        <p className="mt-2 text-xs text-muted-foreground">
          The cooperative fund covers insurance, tool loans and skilling programmes for members.
        </p>
      </Section>

      <Section title="Per-member breakdown">
        <DataTable head={["Member", "Role", "Booked", "Worker share", "Coop share"]}>
          {perMember.map((m) => (
            <tr key={m.id}>
              <td className="whitespace-nowrap px-4 py-3 font-medium">{m.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{m.role}</td>
              <td className="px-4 py-3">{inr(m.txAmount)}</td>
              <td className="px-4 py-3 font-semibold text-success">{inr(m.txWorkerShare)}</td>
              <td className="px-4 py-3 text-muted-foreground">{inr(m.txCoopShare)}</td>
            </tr>
          ))}
        </DataTable>
      </Section>

      <Section title="All transactions">
        <DataTable head={["ID", "Date", "Member", "Service", "Amount", "Method"]}>
          {tx.map((t) => (
            <tr key={t.id}>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{t.id}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{t.date}</td>
              <td className="px-4 py-3 font-medium">{t.member}</td>
              <td className="px-4 py-3 text-muted-foreground">{t.service}</td>
              <td className="px-4 py-3">{inr(t.amount)}</td>
              <td className="px-4 py-3 capitalize text-muted-foreground">{t.method}</td>
            </tr>
          ))}
        </DataTable>
      </Section>
    </div>
  );
}
