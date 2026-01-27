import express from "express";
import { adminOnly, protect } from "../middlewares/authMiddleware";
import { getAdminStats, healthCheck } from "../controllers/adminController";

const router = express.Router();

router.get("/health", healthCheck);
router.get("/stats", protect, getAdminStats);

export default router;
