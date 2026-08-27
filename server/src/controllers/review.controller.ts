import { Request, Response } from "express";
import { Review } from "../models/Review.model";
import { Booking } from "../models/Booking.model";
import { Worker } from "../models/Worker.model";

/** GET /api/reviews?workerId=... — public reviews, optionally filtered by worker. */
export async function getReviews(req: Request, res: Response) {
  const { workerId } = req.query as { workerId?: string };
  const filter = workerId ? { worker: workerId } : {};
  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  res.status(200).json(reviews);
}

/**
 * POST /api/reviews — customer rates a completed booking.
 * One review per booking; also updates the worker's aggregate rating.
 */
export async function submitReview(req: Request, res: Response) {
  const { bookingId, rating, comment } = req.body as {
    bookingId: string;
    rating: number;
    comment: string;
  };

  if (!bookingId || !rating) {
    return res.status(400).json({ message: "bookingId and rating are required" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }
  if (booking.customer.toString() !== req.user!.userId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  if (booking.status !== "completed") {
    return res.status(400).json({ message: "Only completed bookings can be reviewed" });
  }
  if (booking.rated) {
    return res.status(409).json({ message: "This booking has already been reviewed" });
  }

  const review = await Review.create({
    booking: booking._id,
    worker: booking.worker,
    author: req.user!.userId,
    authorName: booking.customerName,
    rating,
    comment: comment ?? "",
    service: booking.service,
  });

  booking.rated = true;
  await booking.save();

  // Recompute the worker's aggregate rating from all their reviews.
  const worker = await Worker.findById(booking.worker);
  if (worker) {
    const allReviews = await Review.find({ worker: worker._id });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    worker.rating = Math.round(avg * 10) / 10;
    worker.reviews = allReviews.length;
    await worker.save();
  }

  res.status(201).json(review);
}
