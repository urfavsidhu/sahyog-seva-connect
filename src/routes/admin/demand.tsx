import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin } from "lucide-react";
import { getPlatformAnalytics } from "@/api/services";
import { Card, DataTable, ErrorState, Loading, PageHeader, Section, useAsync } from "@/components/kit";
import { MapView } from "@/components/MapView";

export const Route = createFileRoute("/admin/demand")({
  head: () => ({ meta: [{ title: "Demand map — SahyogSeva Admin" }] }),
  component: DemandPage,
});

function DemandPage() {
  const analytics = useAsync(getPlatformAnalytics);

  if (analytics.loading) return <Loading label="Loading demand data…" />;
  if (analytics.error) return <ErrorState message={analytics.error} onRetry={analytics.retry} />;

  const areas = analytics.data?.areaDemand ?? [];

  return (
    <div>
      <PageHeader title="Area-wise demand" subtitle="Which areas need which services most" />

      <Section title="Demand hotspots">
        <MapView
          height={360}
          center={[18.53, 73.85]}
          zoom={11}
          markers={areas.map((a) => ({
            lat: a.lat,
            lng: a.lng,
            label: `${a.area} · ${a.top} · ${a.requests} requests`,
            tone: a.unmet > 40 ? "urgent" : "primary",
          }))}
        />
      </Section>

      <Section title="Breakdown by area">
        <DataTable head={["Area", "Top demand", "Requests", "Unmet %"]}>
          {areas.map((a) => (
            <tr key={a.area}>
              <td className="whitespace-nowrap px-4 py-3 font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {a.area}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{a.top}</td>
              <td className="px-4 py-3">{a.requests}</td>
              <td className="px-4 py-3">
                <span className={a.unmet > 40 ? "flex items-center gap-1 font-semibold text-urgent" : "text-muted-foreground"}>
                  {a.unmet > 40 && <AlertTriangle className="h-3.5 w-3.5" />}
                  {a.unmet}%
                </span>
              </td>
            </tr>
          ))}
        </DataTable>
      </Section>

      <Card className="text-xs text-muted-foreground">
        High unmet-demand areas (marked in red on the map) are good targets for cooperative recruitment drives.
      </Card>
    </div>
  );
}
