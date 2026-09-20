import express from "express";
import {
    getDashboardStats,
    getStudents,
    getApplications,
    getProfile,
    upsertProfile
} from "../controllers/collegeController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, allowRoles("college"));

router.get("/stats", getDashboardStats);
router.get("/students", getStudents);
router.get("/applications", getApplications);
router.get("/profile", getProfile);
router.post("/profile", upsertProfile);

export default router;
