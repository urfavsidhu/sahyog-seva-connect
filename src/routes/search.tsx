import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LayoutGrid, Map as MapIcon, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { getCategories, searchWorkers } from "@/api/services";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  Loading,
  PageHeader,
  inr,
  useAsync,
} from "@/components/kit";
import { MapView } from "@/components/MapView";
import { WorkerCard } from "@/components/WorkerCard";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  urgent: z.boolean().optional(),
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Find a worker — SahyogSeva" },
      {
        name: "description",
        content:
          "Search verified cooperative workers by service, distance, price and rating. Filter and book in seconds.",
      },
      { property: "og:title", content: "Find a worker — SahyogSeva" },
      { property: "og:description", content: "Filter cooperative workers near you and book instantly." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const params = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const [q, setQ] = useState(params.q ?? "");
  const [category, setCategory] = useState(params.category ?? "all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [maxPrice, setMaxPrice] = useState(600);
  const [minRating, setMinRating] = useState(0);
  const [view, setView] = useState<"list" | "map">("list");
  const [showFilters, setShowFilters] = useState(false);

  const cats = useAsync(getCategories);
  const results = useAsync(
    () => searchWorkers({ q, category, maxDistance, maxPrice, minRating }),
    [q, category, maxDistance, maxPrice, minRating],
  );

  return (
    <div>
      <PageHeader
        title="Find a worker"
        subtitle={params.urgent ? "Urgent bookings — available today" : "Verified cooperative members near you"}
        action={
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "tap flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold capitalize",
                  view === v ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                )}
              >
                {v === "list" ? <LayoutGrid className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-4 flex gap-2">
        <div className="surface flex flex-1 items-center gap-2 px-3 py-0">
          <SearchIcon className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              navigate({ search: (s) => ({ ...s, q: e.target.value }) });
            }}
            placeholder="Search service or worker"
            aria-label="Search"
            className="h-12 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <Button variant="outline" size="lg" onClick={() => setShowFilters((s) => !s)}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {[{ id: "all", name: "All" }, ...(cats.data ?? [])].map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCategory(c.id);
              navigate({ search: (s) => ({ ...s, category: c.id }) });
            }}
            className={cn(
              "tap tap-active whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold",
              category === c.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {showFilters && (
        <Card className="mb-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-semibold">
            Max distance: {maxDistance} km
            <input
              type="range"
              min={1}
              max={15}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="text-sm font-semibold">
            Max price: {inr(maxPrice)}/hr
            <input
              type="range"
              min={200}
              max={600}
              step={20}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
          <label className="text-sm font-semibold">
            Min rating: {minRating || "any"}
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--color-primary)]"
            />
          </label>
        </Card>
      )}

      {results.loading ? (
        <Loading label="Searching…" />
      ) : results.error ? (
        <ErrorState message={results.error} onRetry={results.retry} />
      ) : !results.data?.length ? (
        <EmptyState
          title="No workers match"
          body="Try widening the distance or price range."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setMaxDistance(15);
                setMaxPrice(600);
                setMinRating(0);
                setCategory("all");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : view === "map" ? (
        <MapView
          height={460}
          markers={results.data.map((w) => ({
            lat: w.lat,
            lng: w.lng,
            label: `${w.name} · ${inr(w.pricePerHour)}/hr`,
          }))}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {results.data.map((w) => (
            <WorkerCard key={w.id} worker={w} />
          ))}
        </div>
      )}
    </div>
  );
}
