import { Router } from "express";
import {
  getWorkerEarnings,
  getCoopAnalytics,
  getPlatformAnalytics,
  getTransactions,
  getDisputes,
} from "../controllers/analytics.controller";
import { protect, requireRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/worker", requireRole("worker"), getWorkerEarnings);
router.get("/coop", requireRole("coop"), getCoopAnalytics);
router.get("/platform", requireRole("admin"), getPlatformAnalytics);
router.get("/transactions", requireRole("coop", "admin"), getTransactions);
router.get("/disputes", requireRole("coop", "admin"), getDisputes);

export default router;
