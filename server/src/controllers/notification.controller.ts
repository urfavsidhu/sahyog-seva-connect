import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { Worker } from "../models/Worker.model";

/**
 * GET /api/notifications
 * Lightweight notifications derived from the logged-in user's recent
 * booking activity — no separate Notification model, since the frontend
 * mock (mock-data.ts -> notifications) is just booking-status blurbs.
 * Customers see updates on their bookings; workers see updates on jobs
 * assigned to them.
 */
export async function getNotifications(req: Request, res: Response) {
  const { userId, role } = req.user!;

  let bookings;
  if (role === "worker") {
    const worker = await Worker.findOne({ user: userId });
    bookings = worker
      ? await Booking.find({ worker: worker._id }).sort({ updatedAt: -1 }).limit(20)
      : [];
  } else {
    bookings = await Booking.find({ customer: userId }).sort({ updatedAt: -1 }).limit(20);
  }

  const notifications = bookings.map((b) => ({
    id: b.id,
    title: notificationTitle(b.status),
    message: `${b.service} — ${b.date} at ${b.slot}`,
    status: b.status,
    bookingId: b.id,
    date: b.updatedAt,
  }));

  res.status(200).json(notifications);
}

function notificationTitle(status: string): string {
  switch (status) {
    case "pending":
      return "Booking requested";
    case "confirmed":
      return "Booking confirmed";
    case "in-progress":
      return "Work in progress";
    case "completed":
      return "Job completed";
    case "cancelled":
      return "Booking cancelled";
    default:
      return "Booking update";
  }
}
