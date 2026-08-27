import { Router } from "express";
import {
  getWorkers,
  getWorker,
  searchWorkers,
  getCurrentWorker,
  getWorkerBookings,
  updateWorkerProfile,
} from "../controllers/worker.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Public — anyone (even logged out) can browse/search workers.
router.get("/search", searchWorkers);
router.get("/", getWorkers);

// Protected — the logged-in worker's own profile/dashboard.
// Mounted before "/:id" so "me" is never treated as an ObjectId param.
router.get("/me", protect, requireRole("worker"), getCurrentWorker);
router.get("/me/bookings", protect, requireRole("worker"), getWorkerBookings);
router.patch("/me", protect, requireRole("worker"), updateWorkerProfile);

// Public — single worker profile page.
router.get("/:id", getWorker);

export default router;
