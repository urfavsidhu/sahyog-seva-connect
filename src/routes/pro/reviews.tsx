import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareText, Star } from "lucide-react";
import { getCurrentWorker, getReviews } from "@/api/services";
import {
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  Stars,
  useAsync,
} from "@/components/kit";

export const Route = createFileRoute("/pro/reviews")({
  head: () => ({ meta: [{ title: "Reviews — SahyogSeva Pro" }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const worker = useAsync(getCurrentWorker);
  const reviews = useAsync(getReviews);

  if (worker.loading || reviews.loading) return <Loading label="Loading reviews…" />;
  if (worker.error) return <ErrorState message={worker.error} onRetry={worker.retry} />;
  if (reviews.error) return <ErrorState message={reviews.error} onRetry={reviews.retry} />;

  const w = worker.data;
  const list = reviews.data ?? [];
  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: list.filter((r) => r.rating === star).length,
  }));

  return (
    <div>
      <PageHeader title="Ratings received" subtitle="What customers are saying about your work" />

      <Card className="mb-6 flex flex-col items-center gap-3 sm:flex-row sm:items-stretch">
        <div className="flex flex-col items-center justify-center px-4 py-2 text-center">
          <p className="text-4xl font-extrabold">{w?.rating.toFixed(1)}</p>
          <Stars value={w?.rating ?? 0} size={16} />
          <p className="mt-1 text-xs text-muted-foreground">{w?.reviews} reviews</p>
        </div>
        <div className="h-px w-full bg-border sm:h-auto sm:w-px" />
        <div className="flex-1 space-y-1.5 px-2 py-2">
          {breakdown.map((b) => (
            <div key={b.star} className="flex items-center gap-2 text-xs">
              <span className="flex w-8 items-center gap-0.5 font-semibold">
                {b.star} <Star className="h-3 w-3 fill-accent text-accent" />
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${list.length ? (b.count / list.length) * 100 : 0}%` }}
                />
              </div>
              <span className="w-4 text-right text-muted-foreground">{b.count}</span>
            </div>
          ))}
        </div>
      </Card>

      {list.length === 0 ? (
        <EmptyState icon={MessageSquareText} title="No reviews yet" body="Reviews appear after jobs are completed." />
      ) : (
        <div className="space-y-3">
          {list.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.author}</p>
                  <p className="text-xs text-muted-foreground">{r.service}</p>
                </div>
                <Stars value={r.rating} size={14} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              <p className="mt-2 text-[11px] text-muted-foreground">{r.date}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
