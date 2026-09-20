import express from "express";
import {
    createProgram,
    getMyPrograms,
    getPublishedPrograms,
    enrollInProgram,
    getProgramStudents,
    updateProgramStatus
} from "../controllers/programController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/programs - Students view published programs
router.get("/", protect, allowRoles("student"), getPublishedPrograms);

// POST /api/programs/:id/enroll - Students enroll
router.post("/:id/enroll", protect, allowRoles("student"), enrollInProgram);

// GET /api/programs/my - Industry view their own programs
router.get("/my", protect, allowRoles("industry"), getMyPrograms);

// POST /api/programs - Industry creates program
router.post("/", protect, allowRoles("industry"), createProgram);

// GET /api/programs/:id/students - Industry views enrolled students
router.get("/:id/students", protect, allowRoles("industry"), getProgramStudents);

// PATCH /api/programs/:id/status - Industry closes/updates program
router.patch("/:id/status", protect, allowRoles("industry"), updateProgramStatus);

export default router;
