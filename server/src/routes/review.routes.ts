import { Router } from "express";
import { getReviews, submitReview } from "../controllers/review.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

// Public — reviews are visible to anyone browsing a worker's profile.
router.get("/", getReviews);

// Protected — only the customer who booked can submit a review.
router.post("/", protect, requireRole("customer"), submitReview);

export default router;
