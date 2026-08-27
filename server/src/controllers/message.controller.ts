import { Request, Response } from "express";
import { Message } from "../models/Message.model";
import { Booking } from "../models/Booking.model";
import { Worker } from "../models/Worker.model";

/** GET /api/messages/:bookingId — chat history for one booking. */
export async function getMessages(req: Request, res: Response) {
  const { bookingId } = req.params;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const access = await canAccessBookingChat(booking, req.user!.userId, req.user!.role);
  if (!access) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const messages = await Message.find({ booking: bookingId }).sort({ createdAt: 1 });
  res.status(200).json(messages);
}

/** POST /api/messages/:bookingId — send a chat message on a booking. */
export async function sendMessage(req: Request, res: Response) {
  const { bookingId } = req.params;
  const { text } = req.body as { text: string };

  if (!text || !text.trim()) {
    return res.status(400).json({ message: "Message text is required" });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const access = await canAccessBookingChat(booking, req.user!.userId, req.user!.role);
  if (!access) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const senderRole = req.user!.role === "worker" ? "worker" : "customer";

  const message = await Message.create({
    booking: booking._id,
    sender: req.user!.userId,
    senderRole,
    text: text.trim(),
  });

  res.status(201).json(message);
}

/** Only the booking's customer or its assigned worker (or admin) may read/send chat. */
async function canAccessBookingChat(
  booking: { customer: any; worker: any },
  userId: string,
  role: string,
): Promise<boolean> {
  if (role === "admin") return true;
  if (booking.customer.toString() === userId) return true;

  const worker = await Worker.findById(booking.worker);
  return worker?.user.toString() === userId;
}
