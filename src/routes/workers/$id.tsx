import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Briefcase, CalendarCheck, MapPin, MessageSquareText, Zap } from "lucide-react";
import { getReviews, getWorker } from "@/api/services";
import { Badge, Button, Card, ErrorState, Loading, Section, Stars, inr, useAsync } from "@/components/kit";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/workers/$id")({
  head: () => ({ meta: [{ title: "Worker profile — SahyogSeva" }] }),
  component: WorkerProfilePage,
});

function WorkerProfilePage() {
  const { id } = Route.useParams();
  const worker = useAsync(() => getWorker(id), [id]);
  const reviews = useAsync(getReviews);

  if (worker.loading) return <Loading label="Loading profile…" />;
  if (worker.error) return <ErrorState message={worker.error} onRetry={worker.retry} />;
  const w = worker.data;
  if (!w) return <ErrorState message="We couldn't find this worker. They may no longer be listed." />;

  return (
    <div className="mx-auto max-w-3xl pb-8">
      <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:text-left">
        <img src={w.photo} alt={w.name} className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center justify-center gap-1.5 text-lg font-bold sm:justify-start">
            {w.name}
            {w.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </p>
          <p className="text-sm text-muted-foreground">{w.category} · {w.experienceYears} years experience</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 text-sm sm:justify-start">
            <span className="flex items-center gap-1">
              <Stars value={w.rating} /> <span className="font-semibold">{w.rating}</span> ({w.reviews})
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Briefcase className="h-4 w-4" /> {w.jobsCompleted} jobs
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {w.distanceKm} km away
            </span>
          </div>
          <p className="mt-2 text-xs font-semibold text-primary">{w.cooperative}</p>
        </div>
        <div className="w-full shrink-0 text-center sm:w-auto sm:text-right">
          <p className="text-2xl font-extrabold">
            {inr(w.pricePerHour)}
            <span className="text-sm font-medium text-muted-foreground">/hr</span>
          </p>
          {w.availableToday && (
            <Badge tone="success" className="mt-1">
              <Zap className="h-3 w-3" /> Available today
            </Badge>
          )}
          <Link to="/book/$id" params={{ id: w.id }} className="mt-3 block">
            <Button full>Book Now</Button>
          </Link>
        </div>
      </Card>

      <Section title="About">
        <Card>
          <p className="text-sm text-muted-foreground">{w.bio}</p>
        </Card>
      </Section>

      <Section title="Skills">
        <div className="flex flex-wrap gap-2">
          {w.skills.map((s) => (
            <Badge key={s} tone="primary">
              {s}
            </Badge>
          ))}
        </div>
      </Section>

      <Section title="Service area">
        <MapView height={240} center={[w.lat, w.lng]} markers={[{ lat: w.lat, lng: w.lng, label: w.name }]} radiusKm={w.distanceKm} />
      </Section>

      <Section title="Availability">
        <Card className="flex items-center gap-3">
          <span className="rounded-xl bg-primary-soft p-2.5 text-primary">
            <CalendarCheck className="h-5 w-5" />
          </span>
          <p className="text-sm">
            {w.availableToday
              ? "Available for booking today. Pick a date and time slot on the next step."
              : "Not available today — check the booking page for the next open slot."}
          </p>
        </Card>
      </Section>

      <Section title="Reviews">
        {(reviews.data ?? []).length === 0 ? (
          <Card className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquareText className="h-4 w-4" /> No reviews yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {(reviews.data ?? []).slice(0, 4).map((r) => (
              <Card key={r.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{r.author}</p>
                    <p className="text-xs text-muted-foreground">{r.service}</p>
                  </div>
                  <Stars value={r.rating} size={14} />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Link to="/book/$id" params={{ id: w.id }} className="block lg:hidden">
        <Button full size="lg">
          Book Now · {inr(w.pricePerHour)}/hr
        </Button>
      </Link>
    </div>
  );
}
