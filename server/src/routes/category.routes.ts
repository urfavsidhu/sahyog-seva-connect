import { Router } from "express";
import { getCategories, createCategory, updateCategory } from "../controllers/category.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Public — home page service grid.
router.get("/", getCategories);

// Admin only.
router.post("/", protect, requireRole("admin"), createCategory);
router.patch("/:id", protect, requireRole("admin"), updateCategory);

export default router;
