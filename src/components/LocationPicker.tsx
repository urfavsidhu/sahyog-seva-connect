import { Check, ChevronDown, Loader2, MapPin, Navigation } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/app-store";
import { LOCATIONS, distanceKm, type LocationOption } from "@/lib/locations";
import { cn } from "@/lib/utils";

export function LocationPicker() {
  const { location, setLocation, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (l: LocationOption) => {
    setLocation(l);
    setOpen(false);
    setGeoError(null);
  };

  const fullLabel = (name: string, id: string) =>
    id === "current"
      ? name
      : lang === "en"
        ? `${name}, Maharashtra- India`
        : `${name}, महाराष्ट्र- भारत`;

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(lang === "en" ? "Geolocation not supported" : "जियोलोकेशन उपलब्ध नहीं है");
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // snap to the nearest known locality so distance-based search still works
        const nearest = LOCATIONS.slice().sort((a, b) => distanceKm(here, a) - distanceKm(here, b))[0]!;
        const currentLabel = lang === "en" ? "Current location" : "वर्तमान स्थान";
        choose({ ...nearest, id: "current", name: currentLabel, nameHi: currentLabel, lat: here.lat, lng: here.lng });
        setLocating(false);
      },
      () => {
        setGeoError(lang === "en" ? "Couldn't get your location" : "स्थान नहीं मिल पाया");
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="tap tap-active flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-card hover:bg-secondary"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <MapPin className="h-4 w-4 shrink-0 text-foreground" />
        <span className="max-w-[11rem] truncate sm:max-w-[16rem]">
          {fullLabel(lang === "en" ? location.name : location.nameHi, location.id)}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-border bg-card p-2 shadow-pop sm:left-1/2 sm:-translate-x-1/2">
          <button
            onClick={useCurrentLocation}
            disabled={locating}
            className="tap flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-primary-soft disabled:opacity-60"
          >
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
            {lang === "en" ? "Use my current location" : "मेरा वर्तमान स्थान उपयोग करें"}
          </button>
          {geoError && <p className="px-3 pb-1 text-xs text-destructive">{geoError}</p>}

          <p className="mt-1 px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {lang === "en" ? "Pune areas" : "पुणे के क्षेत्र"}
          </p>
          <div className="max-h-64 overflow-y-auto">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                onClick={() => choose(l)}
                className={cn(
                  "tap flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-secondary",
                  location.id === l.id && "bg-primary-soft text-primary",
                )}
              >
                {lang === "en" ? l.name : l.nameHi}
                {location.id === l.id && <Check className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
