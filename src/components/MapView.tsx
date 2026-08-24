import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface MapMarker {
  lat: number;
  lng: number;
  label?: string;
  tone?: "primary" | "accent" | "urgent";
}

/**
 * Leaflet + OpenStreetMap view. Leaflet is imported dynamically after mount so
 * it never runs during SSR. Coordinates are mock data.
 */
export function MapView({
  markers = [],
  center,
  zoom = 13,
  radiusKm,
  className,
  height = 260,
}: {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  radiusKm?: number;
  className?: string;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("leaflet").Map | undefined;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (disposed || !ref.current || mapRef.current) return;

      const first = markers[0];
      const c: [number, number] = center ?? (first ? [first.lat, first.lng] : [18.5204, 73.8567]);
      map = L.map(ref.current, { scrollWheelZoom: false, attributionControl: true }).setView(c, zoom);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const colors = {
        primary: "oklch(0.52 0.1 195)",
        accent: "oklch(0.76 0.15 68)",
        urgent: "oklch(0.62 0.19 35)",
      };

      markers.forEach((m) => {
        const color = colors[m.tone ?? "primary"];
        const icon = L.divIcon({
          className: "",
          html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};box-shadow:0 0 0 4px ${color}33, 0 2px 6px rgba(0,0,0,.3);border:2px solid white"></span>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map!);
        if (m.label) marker.bindPopup(m.label);
      });

      if (radiusKm && markers[0]) {
        L.circle([markers[0].lat, markers[0].lng], {
          radius: radiusKm * 1000,
          color: colors.primary,
          fillColor: colors.primary,
          fillOpacity: 0.12,
          weight: 1.5,
        }).addTo(map);
      }

      if (markers.length > 1) {
        map.fitBounds(
          markers.map((m) => [m.lat, m.lng] as [number, number]),
          { padding: [40, 40] },
        );
      }
      setTimeout(() => map?.invalidateSize(), 120);
    })();

    return () => {
      disposed = true;
      (mapRef.current as import("leaflet").Map | null)?.remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(markers), JSON.stringify(center), zoom, radiusKm]);

  return (
    <div
      ref={ref}
      style={{ height }}
      className={cn("w-full overflow-hidden rounded-xl border bg-muted", className)}
      aria-label="Map view"
    />
  );
}
