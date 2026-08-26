import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Ban,
  Calendar,
  Check,
  Clock,
  Copy,
  IndianRupee,
  ListChecks,
  MapPin,
  Star,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { getBookings, submitReview, updateBookingStatus } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  StatCard,
  StatusBadge,
  inr,
  useAsync,
} from "@/components/kit";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [{ title: "Your bookings — SahyogSeva" }],
  }),
  component: BookingsPage,
});

const TABS = [
  { id: "upcoming", label: "Upcoming", statuses: ["pending", "confirmed", "in-progress"] },
  { id: "completed", label: "Completed", statuses: ["completed"] },
  { id: "cancelled", label: "Cancelled", statuses: ["cancelled"] },
] as const;

const UPCOMING_STATUSES: Booking["status"][] = ["pending", "confirmed", "in-progress"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function BookingsPage() {
  const bookings = useAsync(getBookings);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("upcoming");
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [rateTarget, setRateTarget] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const data = bookings.data ?? [];
  const activeStatuses: readonly string[] = TABS.find((t) => t.id === tab)?.statuses ?? [];
  const filtered = data
    .filter((b) => activeStatuses.includes(b.status))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const counts = {
    upcoming: data.filter((b) => UPCOMING_STATUSES.includes(b.status)).length,
    completed: data.filter((b) => b.status === "completed").length,
    spent: data.filter((b) => b.status === "completed").reduce((sum, b) => sum + b.price, 0),
  };

  async function handleCancel(id: string) {
    setCancellingId(id);
    try {
      await updateBookingStatus(id, "cancelled");
      bookings.setData((prev) =>
        prev ? prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)) : prev,
      );
    } finally {
      setCancellingId(null);
    }
  }

  function openRate(b: Booking) {
    setRateTarget(b);
    setRating(5);
    setHoverRating(0);
    setComment("");
  }

  async function submitRating() {
    if (!rateTarget) return;
    setSubmittingReview(true);
    try {
      await submitReview({ bookingId: rateTarget.id, rating, comment });
      bookings.setData((prev) =>
        prev ? prev.map((b) => (b.id === rateTarget.id ? { ...b, rated: true } : b)) : prev,
      );
      setRateTarget(null);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div>
      <PageHeader title="Your bookings" subtitle="Track, manage and review your service requests" />

      {!bookings.loading && !bookings.error && data.length > 0 && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <StatCard
            icon={ListChecks}
            label="Upcoming"
            value={String(counts.upcoming)}
            tone="primary"
          />
          <StatCard
            icon={BadgeCheck}
            label="Completed"
            value={String(counts.completed)}
            tone="success"
          />
          <StatCard
            icon={IndianRupee}
            label="Total spent"
            value={inr(counts.spent)}
            tone="accent"
          />
        </div>
      )}

      <div className="mb-4 flex gap-1 rounded-xl bg-secondary p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "tap flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
              tab === t.id ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {bookings.loading ? (
        <Loading label="Loading your bookings…" />
      ) : bookings.error ? (
        <ErrorState message={bookings.error} onRetry={bookings.retry} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title={`No ${tab} bookings`}
          body={
            tab === "upcoming"
              ? "Book a verified cooperative worker to see it here."
              : "Nothing to show in this tab yet."
          }
          action={
            <Link to="/search">
              <Button>Find a worker</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <Card key={b.id} className="flex flex-col gap-3">
              <div className="flex gap-3">
                <img
                  src={b.workerPhoto}
                  alt={b.workerName}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover object-top"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{b.workerName}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.service}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {formatDate(b.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {b.slot}
                    </span>
                    {b.urgent && (
                      <span className="flex items-center gap-1 font-semibold text-urgent">
                        <Zap className="h-3.5 w-3.5" /> Urgent
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {b.address}
              </p>

              <div className="flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-foreground">
                    {inr(b.price)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" />
                    {b.payment === "online" ? "Paid online" : "Cash"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {(b.status === "pending" || b.status === "confirmed") && (
                    <>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(b.otp);
                          setCopiedId(b.id);
                          setTimeout(() => setCopiedId(null), 1200);
                        }}
                        className="tap tap-active flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold hover:bg-secondary"
                      >
                        {copiedId === b.id ? (
                          <Check className="h-3.5 w-3.5 text-success" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        OTP {b.otp}
                      </button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={cancellingId === b.id}
                        onClick={() => handleCancel(b.id)}
                      >
                        <Ban className="h-3.5 w-3.5" />
                        {cancellingId === b.id ? "Cancelling…" : "Cancel"}
                      </Button>
                    </>
                  )}

                  {b.status === "in-progress" && (
                    <span className="rounded-lg bg-primary-soft px-2.5 py-1.5 text-xs font-semibold text-primary">
                      OTP {b.otp}
                    </span>
                  )}

                  {b.status === "completed" &&
                    (b.rated ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-success">
                        <Star className="h-3.5 w-3.5 fill-success" /> Rated
                      </span>
                    ) : (
                      <Button size="sm" onClick={() => openRate(b)}>
                        <Star className="h-3.5 w-3.5" /> Rate service
                      </Button>
                    ))}

                  {b.status === "cancelled" && (
                    <Link to="/book/$id" params={{ id: b.workerId }}>
                      <Button variant="outline" size="sm">
                        Book again
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* rate dialog */}
      <Dialog open={!!rateTarget} onOpenChange={(open) => !open && setRateTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {rateTarget?.workerName}</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-1 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${i} star`}
                className="tap tap-active p-1"
              >
                <Star
                  className={cn(
                    "h-8 w-8",
                    i <= (hoverRating || rating)
                      ? "fill-accent text-accent"
                      : "text-muted-foreground/40",
                  )}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How was the service? (optional)"
            rows={3}
            className="surface w-full resize-none p-3 text-sm outline-none placeholder:text-muted-foreground"
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setRateTarget(null)}>
              Cancel
            </Button>
            <Button onClick={submitRating} disabled={submittingReview}>
              {submittingReview ? "Submitting…" : "Submit rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
