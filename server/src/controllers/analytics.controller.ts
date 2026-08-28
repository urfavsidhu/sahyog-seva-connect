import { Request, Response } from "express";
import { Worker } from "../models/Worker.model";
import { Booking } from "../models/Booking.model";
import { Cooperative } from "../models/Cooperative.model";
import { Transaction } from "../models/Transaction.model";
import { Dispute } from "../models/Dispute.model";

const AREAS = [
  { area: "Baner", lat: 18.559, lng: 73.7868 },
  { area: "Kothrud", lat: 18.5074, lng: 73.8077 },
  { area: "Viman Nagar", lat: 18.5679, lng: 73.9143 },
  { area: "Hadapsar", lat: 18.5089, lng: 73.926 },
  { area: "Kharadi", lat: 18.5515, lng: 73.947 },
  { area: "Shivaji Nagar", lat: 18.5304, lng: 73.8467 },
  { area: "Hinjewadi", lat: 18.5975, lng: 73.7623 },
  { area: "Wakad", lat: 18.5989, lng: 73.7645 },
];

function nearestArea(lat: number, lng: number) {
  let best = AREAS[0];
  let bestDist = Infinity;
  for (const a of AREAS) {
    const d = (a.lat - lat) ** 2 + (a.lng - lng) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = a;
    }
  }
  return best.area;
}

/** GET /api/analytics/worker — logged-in worker's earnings breakdown. */
export async function getWorkerEarnings(req: Request, res: Response) {
  const worker = await Worker.findOne({ user: req.user!.userId });
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }

  const bookings = await Booking.find({ worker: worker._id, status: "completed" });
  const now = new Date();

  const week = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date(now);
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    const dayBookings = bookings.filter(
      (b) => b.updatedAt.toISOString().slice(0, 10) === key,
    );
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      earnings: dayBookings.reduce((sum, b) => sum + b.price, 0),
      jobs: dayBookings.length,
    };
  });

  const month = Array.from({ length: 4 }).map((_, i) => {
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() - (3 - i) * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);
    const weekBookings = bookings.filter(
      (b) => b.updatedAt >= weekStart && b.updatedAt <= weekEnd,
    );
    return {
      label: `Week ${i + 1}`,
      earnings: weekBookings.reduce((sum, b) => sum + b.price, 0),
      jobs: weekBookings.length,
    };
  });

  res.status(200).json({ week, month, total: worker.earningsThisMonth });
}

/** GET /api/analytics/coop — logged-in coop-admin's cooperative analytics. */
export async function getCoopAnalytics(req: Request, res: Response) {
  const coop = await Cooperative.findOne({ admin: req.user!.userId });
  if (!coop) {
    return res.status(404).json({ message: "Cooperative not found for this account" });
  }

  const transactions = await Transaction.find({ cooperative: coop._id }).sort({ date: 1 });

  const jobsOverTime = groupByDate(transactions, (t) => t.date, (t) => t.amount);
  const categoryBreakdown = groupByKey(transactions, (t) => t.service, (t) => t.amount);

  res.status(200).json({ jobsOverTime, categoryBreakdown });
}

/** GET /api/analytics/platform — admin-only, platform-wide trends. */
export async function getPlatformAnalytics(req: Request, res: Response) {
  const transactions = await Transaction.find().sort({ date: 1 });
  const trend = groupByDate(transactions, (t) => t.date, (t) => t.amount);

  const bookings = await Booking.find();
  const grouped = new Map
    string,
    { requests: number; unmet: number; services: Map<string, number> }
  >();

  for (const b of bookings) {
    const area = nearestArea(b.lat, b.lng);
    if (!grouped.has(area)) {
      grouped.set(area, { requests: 0, unmet: 0, services: new Map() });
    }
    const g = grouped.get(area)!;
    g.requests += 1;
    if (b.status === "cancelled" || b.status === "pending") g.unmet += 1;
    g.services.set(b.service, (g.services.get(b.service) ?? 0) + 1);
  }

  const areaDemand = AREAS.map(({ area, lat, lng }) => {
    const g = grouped.get(area);
    if (!g || g.requests === 0) {
      return { area, lat, lng, top: "—", requests: 0, unmet: 0 };
    }
    const top = [...g.services.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return {
      area,
      lat,
      lng,
      top,
      requests: g.requests,
      unmet: Math.round((g.unmet / g.requests) * 100),
    };
  });

  res.status(200).json({ trend, areaDemand });
}

/** GET /api/analytics/transactions — coop-admin/admin transaction ledger. */
export async function getTransactions(req: Request, res: Response) {
  const filter = req.user!.role === "admin" ? {} : await coopFilterFor(req.user!.userId);
  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.status(200).json(transactions);
}

/** GET /api/analytics/disputes — coop-admin/admin dispute queue. */
export async function getDisputes(req: Request, res: Response) {
  const disputes = await Dispute.find().sort({ date: -1 });
  res.status(200).json(disputes);
}

async function coopFilterFor(userId: string) {
  const coop = await Cooperative.findOne({ admin: userId });
  return coop ? { cooperative: coop._id } : { cooperative: null };
}

function groupByDate<T>(items: T[], getDate: (t: T) => Date, getValue: (t: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getDate(item).toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + getValue(item));
  }
  return Array.from(map.entries()).map(([date, value]) => ({ date, value }));
}

function groupByKey<T>(items: T[], getKey: (t: T) => string, getValue: (t: T) => number) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = getKey(item);
    map.set(key, (map.get(key) ?? 0) + getValue(item));
  }
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}
