import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Zap } from "lucide-react";
import { Badge, Button, Card, Stars, inr } from "./kit";
import { useApp } from "@/lib/app-store";
import type { Worker } from "@/lib/types";

export function WorkerCard({ worker }: { worker: Worker }) {
  const { isAuthenticated } = useApp();
  return (
    <Card className="flex gap-3">
      <img
        src={worker.photo}
        alt={worker.name}
        loading="lazy"
        className="h-16 w-16 shrink-0 rounded-xl object-cover object-top"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="flex items-center gap-1 truncate font-semibold">
              {worker.name}
              {worker.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-primary" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {worker.category} · {worker.experienceYears} yrs
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold">
            {inr(worker.pricePerHour)}
            <span className="text-xs font-medium text-muted-foreground">/hr</span>
          </p>
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Stars value={worker.rating} size={12} />
            <span className="font-semibold text-foreground">{worker.rating}</span> ({worker.reviews})
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {worker.distanceKm} km
          </span>
          {worker.availableToday && (
            <Badge tone="success">
              <Zap className="h-3 w-3" /> Today
            </Badge>
          )}
        </div>

        <p className="mt-1.5 truncate text-xs text-muted-foreground">{worker.cooperative}</p>

        <div className="mt-3 flex gap-2">
          <Link to="/workers/$id" params={{ id: worker.id }} className="flex-1">
            <Button variant="outline" size="sm" full>
              View
            </Button>
          </Link>
          {isAuthenticated ? (
            <Link to="/book/$id" params={{ id: worker.id }} className="flex-1">
              <Button size="sm" full>
                Book
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="flex-1">
              <Button size="sm" full>
                Book
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
