import { Router } from "express";
import {
  getCooperatives,
  getMyCooperative,
  getMembers,
  createCooperative,
  updateCooperativeStatus,
} from "../controllers/coop.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Public — anyone can see approved cooperatives.
router.get("/", getCooperatives);

// Protected — coop-admin's own dashboard data.
router.get("/me", protect, requireRole("coop"), getMyCooperative);
router.get("/members", protect, requireRole("coop"), getMembers);

// Admin only — approve/reject cooperatives.
router.post("/", protect, requireRole("admin"), createCooperative);
router.patch("/:id/status", protect, requireRole("admin"), updateCooperativeStatus);

export default router;
