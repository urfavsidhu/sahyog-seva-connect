import { Request, Response } from "express";
import { Worker } from "../models/Worker.model";
import { Booking } from "../models/Booking.model";
import { distanceKm } from "../utils/distance";

/** GET /api/workers — only "active" (verified & approved) workers are public. */
export async function getWorkers(req: Request, res: Response) {
  const workers = await Worker.find({ status: "active" }).populate("user", "name email phone");
  res.status(200).json(workers);
}

/** GET /api/workers/:id */
export async function getWorker(req: Request, res: Response) {
  const worker = await Worker.findById(req.params.id).populate("user", "name email phone");
  if (!worker) {
    return res.status(404).json({ message: "Worker not found" });
  }
  res.status(200).json(worker);
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

  let workers = await Worker.find(filter).populate("user", "name");

  const origin = lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  let results = workers.map((w) => {
    const obj = w.toObject();
    return origin
      ? { ...obj, distanceKm: distanceKm(origin, { lat: w.lat, lng: w.lng }) }
      : obj;
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
  res.status(200).json(worker);
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
  });
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }
  res.status(200).json(worker);
}
