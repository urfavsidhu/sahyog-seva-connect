import { Router } from "express";
import {
  getBookings,
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
router.get("/requests", requireRole("worker"), getIncomingRequests);
router.post("/", requireRole("customer"), createBooking);
router.patch("/:id/status", updateBookingStatus);
router.get("/:id", getBooking);

export default router;
