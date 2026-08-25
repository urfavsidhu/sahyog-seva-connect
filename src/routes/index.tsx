import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { getCategories, getWorkers } from "@/api/services";
import { Badge, Button, Card, ErrorState, Loading, PageHeader, Section, inr, useAsync } from "@/components/kit";
import { WorkerCard } from "@/components/WorkerCard";
import { categoryIcon } from "@/lib/icons";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SahyogSeva — Book Cooperative Home Services" },
      {
        name: "description",
        content:
          "Find verified plumbers, electricians, cleaners, cooks and tutors from local worker cooperatives in Pune. Fair pay, fair price.",
      },
      { property: "og:title", content: "SahyogSeva — Book Cooperative Home Services" },
      {
        property: "og:description",
        content: "Verified local workers, owned by their own cooperatives.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { t, lang } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const cats = useAsync(getCategories);
  const workers = useAsync(getWorkers);

  return (
    <div>
      {/* hero */}
      <section className="surface relative mb-6 overflow-hidden bg-primary p-6 text-primary-foreground sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/30 blur-2xl" />
        <div className="relative">
          <Badge tone="warning" className="mb-3">
            <HeartHandshake className="h-3.5 w-3.5" /> Worker-owned cooperatives
          </Badge>
          <h1 className="max-w-xl text-2xl font-extrabold leading-tight sm:text-3xl">
            {t("findHelp")}
          </h1>
          <p className="mt-2 max-w-lg text-sm opacity-90">
            {lang === "en"
              ? "Verified workers from local cooperatives. 85% of every rupee goes straight to the worker."
              : "स्थानीय सहकारी समितियों के सत्यापित कर्मचारी। हर रुपये का 85% सीधे कर्मचारी को।"}
          </p>

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/search", search: { q } });
            }}
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-card px-3 text-foreground">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Plumber, cleaning, tutor…"
                aria-label="Search services"
                className="h-12 w-full bg-transparent text-sm outline-none"
              />
            </div>
            <Button type="submit" variant="accent" size="lg">
              Go
            </Button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 rounded-full bg-card/15 px-3 py-1.5 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> ID + skill verified
            </span>
            <span className="flex items-center gap-1 rounded-full bg-card/15 px-3 py-1.5 font-semibold">
              <Zap className="h-3.5 w-3.5" /> Urgent in 60 min
            </span>
          </div>
        </div>
      </section>

      {/* categories */}
      <Section
        title="Services"
        action={
          <Link to="/search" className="text-sm font-semibold text-primary">
            See all
          </Link>
        }
      >
        {cats.loading ? (
          <Loading label="Loading services…" />
        ) : cats.error ? (
          <ErrorState message={cats.error} onRetry={cats.retry} />
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {cats.data
              ?.filter((c) => c.active)
              .map((c) => {
                const Icon = categoryIcon(c.icon);
                return (
                  <Link key={c.id} to="/search" search={{ category: c.id }}>
                    <Card interactive className="flex flex-col items-center gap-2 p-3 text-center">
                      <span className="rounded-xl bg-primary-soft p-2.5 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-xs font-semibold leading-tight">
                        {lang === "en" ? c.name : c.nameHi}
                      </span>
                      <span className="text-[11px] text-muted-foreground">from {inr(c.basePrice)}</span>
                    </Card>
                  </Link>
                );
              })}
          </div>
        )}
      </Section>

      {/* urgent */}
      <Section>
        <Card className="flex flex-wrap items-center gap-3 border-urgent/30 bg-urgent-soft">
          <span className="rounded-xl bg-urgent/15 p-2.5 text-urgent">
            <Zap className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{t("urgent")} booking</p>
            <p className="text-xs text-muted-foreground">
              Nearest available worker arrives within an hour.
            </p>
          </div>
          <Link to="/search" search={{ urgent: true }}>
            <Button variant="danger" size="sm">
              Find now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </Section>

      {/* top workers */}
      <Section title="Top rated near you">
        {workers.loading ? (
          <Loading label="Finding workers…" />
        ) : workers.error ? (
          <ErrorState message={workers.error} onRetry={workers.retry} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workers.data
              ?.slice()
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6)
              .map((w) => (
                <WorkerCard key={w.id} worker={w} />
              ))}
          </div>
        )}
      </Section>

      <Section title="Why a cooperative?">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: HeartHandshake,
              title: "Workers own it",
              body: "Every worker is a member-owner who votes on pricing and policy.",
            },
            {
              icon: Sparkles,
              title: "85% payout",
              body: "The remaining 15% funds insurance, training and emergency loans.",
            },
            {
              icon: ShieldCheck,
              title: "Collective trust",
              body: "Cooperatives vouch for their members and resolve disputes locally.",
            },
          ].map((f) => (
            <Card key={f.title}>
              <span className="inline-flex rounded-xl bg-accent-soft p-2.5 text-accent-foreground">
                <f.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{f.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
