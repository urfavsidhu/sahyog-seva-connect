import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, IndianRupee, PiggyBank, Wallet } from "lucide-react";
import { getTransactions } from "@/api/services";
import {
  Badge,
  DataTable,
  ErrorState,
  Loading,
  PageHeader,
  Section,
  StatCard,
  inr,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — SahyogSeva Admin" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const transactions = useAsync(getTransactions);

  if (transactions.loading) return <Loading label="Loading payments…" />;
  if (transactions.error) return <ErrorState message={transactions.error} onRetry={transactions.retry} />;

  const tx = transactions.data ?? [];
  const totalVolume = tx.reduce((s, t) => s + t.amount, 0);
  const totalCommission = tx.reduce((s, t) => s + t.coopShare, 0);
  const online = tx.filter((t) => t.method === "online").reduce((s, t) => s + t.amount, 0);
  const cash = tx.filter((t) => t.method === "cash").reduce((s, t) => s + t.amount, 0);

  return (
    <div>
      <PageHeader title="Payments & commissions" subtitle="Platform-wide financial overview" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total volume" value={inr(totalVolume)} tone="primary" />
        <StatCard icon={PiggyBank} label="Commission earned" value={inr(totalCommission)} tone="success" />
        <StatCard icon={Wallet} label="Paid online" value={inr(online)} tone="accent" />
        <StatCard icon={CreditCard} label="Cash collected" value={inr(cash)} tone="urgent" />
      </div>

      <Section title="Transaction ledger">
        <DataTable head={["ID", "Date", "Member", "Amount", "Worker share", "Coop share", "Method"]}>
          {tx.map((t) => (
            <tr key={t.id}>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{t.id}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{t.date}</td>
              <td className="px-4 py-3 font-medium">{t.member}</td>
              <td className="px-4 py-3">{inr(t.amount)}</td>
              <td className="px-4 py-3 text-success">{inr(t.workerShare)}</td>
              <td className="px-4 py-3 text-muted-foreground">{inr(t.coopShare)}</td>
              <td className="px-4 py-3">
                <Badge tone={t.method === "online" ? "primary" : "neutral"}>{t.method}</Badge>
              </td>
            </tr>
          ))}
        </DataTable>
      </Section>
    </div>
  );
}
