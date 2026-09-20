import express from "express";
import { updateApplicationStatus, createApplication, getMyApplications, getIndustryApplications } from "../controllers/applicationController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/applications/my - Student fetches their own applications
router.get("/my", protect, allowRoles("student"), getMyApplications);

// GET /api/applications/industry - Industry user fetches all applications to them
router.get("/industry", protect, allowRoles("industry"), getIndustryApplications);

// POST /api/applications - Student applies for an opportunity
router.post("/", protect, allowRoles("student"), createApplication);

// PATCH /api/applications/:id/status - Industry updates status
router.patch("/:id/status", protect, allowRoles("industry"), updateApplicationStatus);

export default router;
