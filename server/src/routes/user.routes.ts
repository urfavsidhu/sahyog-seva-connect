import { Router } from "express";
import {
  getCurrentUser,
  updateProfile,
  getUsers,
  updateUserStatus,
  updateUserRole,
} from "../controllers/user.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Any logged-in role can read/edit their own profile.
router.get("/me", protect, getCurrentUser);
router.patch("/me", protect, updateProfile);

// Admin only — full user directory and moderation.
router.get("/", protect, requireRole("admin"), getUsers);
router.patch("/:id/status", protect, requireRole("admin"), updateUserStatus);
router.patch("/:id/role", protect, requireRole("admin"), updateUserRole);

export default router;
