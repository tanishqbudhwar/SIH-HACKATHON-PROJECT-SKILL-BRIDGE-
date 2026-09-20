import express from "express";
import { getProfile, upsertProfile } from "../controllers/industryProfileController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, allowRoles("industry"), getProfile);
router.post("/", protect, allowRoles("industry"), upsertProfile);

export default router;
