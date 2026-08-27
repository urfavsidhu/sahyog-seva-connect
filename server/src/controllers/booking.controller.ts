import { Request, Response } from "express";
import { Booking } from "../models/Booking.model";
import { Worker } from "../models/Worker.model";
import { User } from "../models/User.model";

/** GET /api/bookings/me — logged-in customer's own booking history. */
export async function getBookings(req: Request, res: Response) {
  const bookings = await Booking.find({ customer: req.user!.userId }).sort({ createdAt: -1 });
  res.status(200).json(bookings);
}

/** GET /api/bookings/:id — booking detail; only the owning customer or assigned worker may view it. */
export async function getBooking(req: Request, res: Response) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const worker = await Worker.findById(booking.worker);
  const isOwner = booking.customer.toString() === req.user!.userId;
  const isAssignedWorker = worker?.user.toString() === req.user!.userId;
  const isPrivileged = req.user!.role === "admin" || req.user!.role === "coop";

  if (!isOwner && !isAssignedWorker && !isPrivileged) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.status(200).json(booking);
}

/**
 * GET /api/bookings/requests — incoming pending jobs for the logged-in
 * worker to accept/reject. Mirrors getIncomingRequests() in services.ts.
 */
export async function getIncomingRequests(req: Request, res: Response) {
  const worker = await Worker.findOne({ user: req.user!.userId });
  if (!worker) {
    return res.status(404).json({ message: "Worker profile not found" });
  }
  const requests = await Booking.find({ worker: worker._id, status: "pending" }).sort({
    createdAt: -1,
  });
  res.status(200).json(requests);
}

/** POST /api/bookings — customer creates a booking; generates OTP + id. */
export async function createBooking(req: Request, res: Response) {
  const { workerId, service, date, slot, price, address, urgent, payment, lat, lng } = req.body as {
    workerId: string;
    service: string;
    date: string;
    slot: string;
    price: number;
    address: string;
    urgent?: boolean;
    payment: "online" | "cash";
    lat: number;
    lng: number;
  };

  if (!workerId || !service || !date || !slot || !price || !address) {
    return res.status(400).json({ message: "Missing required booking fields" });
  }

  const worker = await Worker.findById(workerId).populate("user", "name");
  if (!worker) {
    return res.status(404).json({ message: "Worker not found" });
  }

  const customer = await User.findById(req.user!.userId);
  if (!customer) {
    return res.status(404).json({ message: "Customer account not found" });
  }

  const otp = String(Math.floor(1000 + Math.random() * 9000));

  const booking = await Booking.create({
    worker: worker._id,
    workerName: (worker.user as any)?.name ?? "Worker",
    workerPhoto: "",
    customer: customer._id,
    customerName: customer.name,
    customerPhone: customer.phone,
    service,
    date,
    slot,
    status: "pending",
    price,
    address,
    urgent: !!urgent,
    otp,
    payment: payment ?? "cash",
    lat,
    lng,
  });

  res.status(201).json(booking);
}

/**
 * PATCH /api/bookings/:id/status — worker/customer/coop/admin transitions
 * a booking's status (confirmed, in-progress, completed, cancelled).
 * Completing a job requires the correct OTP to be passed in the body.
 */
export async function updateBookingStatus(req: Request, res: Response) {
  const { status, otp } = req.body as { status: string; otp?: string };

  const booking = await Booking.findById(req.params.id);
  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const worker = await Worker.findById(booking.worker);
  const isAssignedWorker = worker?.user.toString() === req.user!.userId;
  const isOwner = booking.customer.toString() === req.user!.userId;
  const isPrivileged = req.user!.role === "admin" || req.user!.role === "coop";

  if (!isAssignedWorker && !isOwner && !isPrivileged) {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (status === "completed") {
    if (otp !== booking.otp) {
      return res.status(400).json({ message: "Incorrect OTP" });
    }
    if (worker) {
      worker.jobsCompleted += 1;
      worker.earningsThisMonth += booking.price;
      await worker.save();
    }
  }

  booking.status = status as typeof booking.status;
  await booking.save();

  res.status(200).json(booking);
}
