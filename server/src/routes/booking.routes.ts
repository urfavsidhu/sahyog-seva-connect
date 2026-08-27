import { Router } from "express";
import {
  getBookings,
  getAllBookingsAdmin,
  getBooking,
  getIncomingRequests,
  createBooking,
  updateBookingStatus,
} from "../controllers/booking.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// All booking routes require a logged-in user.
router.use(protect);

router.get("/me", requireRole("customer"), getBookings);

// Admin only — every booking across every customer (moderation dashboard).
// Mounted before "/:id" so "admin" is never treated as an ObjectId param.
router.get("/admin", requireRole("admin"), getAllBookingsAdmin);

router.get("/requests", requireRole("worker"), getIncomingRequests);
router.post("/", requireRole("customer"), createBooking);
router.patch("/:id/status", updateBookingStatus);
router.get("/:id", getBooking);

export default router;
