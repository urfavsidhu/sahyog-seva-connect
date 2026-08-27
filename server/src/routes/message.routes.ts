import { Router } from "express";
import { getMessages, sendMessage } from "../controllers/message.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/:bookingId", getMessages);
router.post("/:bookingId", sendMessage);

export default router;
