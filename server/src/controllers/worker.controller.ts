import { Request, Response } from "express";
import { Worker, type IWorker } from "../models/Worker.model";
import { Booking } from "../models/Booking.model";
import { distanceKm } from "../utils/distance";

/**
 * Frontend's Worker type (src/lib/types.ts) expects `name` and `photo`
 * directly on the worker object, but those actually live on the linked
 * User document. This flattens a populated Worker doc into that shape.
 */
function toClientWorker(worker: IWorker) {
  const obj = worker.toObject();
  const user = obj.user as any;
  return {
    ...obj,
    id: obj._id,
    name: user?.name ?? "Worker",
    photo: user?.photo ?? `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user?.name ?? "W")}`,
    user: undefined,
  };
}

/** GET /api/workers — public/customer view: only "active" workers. */
export async function getWorkers(req: Request, res: Response) {
  const workers = await Worker.find({ status: "active" }).populate("user", "name email phone");
  res.status(200).json(workers.map(toClientWorker));
}

/**
 * GET /api/workers/admin — admin only. Every status, so pending document
 * verification and suspended workers are visible for moderation
 * (admin/workers.tsx needs this — the public list only shows "active").
 */
export async function getAllWorkersAdmin(req: Request, res: Response) {
  const workers = await Worker.find().populate("user", "name email phone");
  res.status(200).json(workers.map(toClientWorker));
}

/** GET /api/workers/:id */
export async function getWorker(req: Request, res: Response) {
  const worker = await Worker.findById(req.params.id).populate("user", "name email phone");
  if (!worker) {
    return res.status(404).json({ message: "Worker not found" });
  }
  res.status(200).json(toClientWorker(worker));
}

/**
 * GET /api/workers/search
 * Mirrors searchWorkers() in the frontend's services.ts: text query,
 * category, max distance/price, min rating, and an optional origin point
 * to recompute live distance from (navbar location picker).
 */
export async function searchWorkers(req: Request, res: Response) {
  const { q, category, maxDistance, maxPrice, minRating, lat, lng } = req.query as {
    q?: string;
    category?: string;
    maxDistance?: string;
    maxPrice?: string;
    minRating?: string;
    lat?: string;
    lng?: string;
  };

  const filter: Record<string, unknown> = { status: "active" };

  if (category && category !== "all") {
    filter.categoryId = category;
  }
  if (maxPrice !== undefined) {
    filter.pricePerHour = { $lte: Number(maxPrice) };
  }
  if (minRating !== undefined) {
    filter.rating = { $gte: Number(minRating) };
  }
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [{ category: regex }, { skills: regex }];
  }

  const workers = await Worker.find(filter).populate("user", "name email phone");

  const origin = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  let results = workers.map((w) => {
    const client = toClientWorker(w);
    return origin
      ? { ...client, distanceKm: distanceKm(origin, { lat: w.lat, lng: w.lng }) }
      : client;
  });

  if (origin && maxDistance !== undefined) {
    const max = Number(maxDistance);
    results = results.filter((w: any) => w.distanceKm <= max);
  }

  results.sort((a: any, b: any) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));

  res.status(200).json(results);
}

/**
 * GET /api/workers/me — the logged-in worker's own profile.
 * req.user is set by the `protect` middleware; requires role "worker".
 */
export async function getCurrentWorker(req: Request, res: Response) {
  const worker = await Worker.findOne({ user: req.user!.userId }).populate("user", "name email phone");
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }
  res.status(200).json(toClientWorker(worker));
}

/** GET /api/workers/me/bookings — jobs assigned to the logged-in worker. */
export async function getWorkerBookings(req: Request, res: Response) {
  const worker = await Worker.findOne({ user: req.user!.userId });
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }
  const bookings = await Booking.find({ worker: worker._id }).sort({ createdAt: -1 });
  res.status(200).json(bookings);
}

/** PATCH /api/workers/me — worker edits their own profile/pricing/skills. */
export async function updateWorkerProfile(req: Request, res: Response) {
  const worker = await Worker.findOneAndUpdate({ user: req.user!.userId }, req.body, {
    new: true,
    runValidators: true,
  }).populate("user", "name email phone");
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }
  res.status(200).json(toClientWorker(worker));
}
