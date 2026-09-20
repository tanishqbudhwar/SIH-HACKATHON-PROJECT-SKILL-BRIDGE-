import express from "express";

import {
    createProfile,
    getProfile,
    getAllStudents
} from "../controllers/profileController.js";

import {
    protect,
    allowRoles
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
    "/",
    protect,
    allowRoles("student"),
    createProfile
);

router.get(
    "/",
    protect,
    allowRoles("student"),
    getProfile
);

// GET /api/profile/students - Industry user fetches all students
router.get(
    "/students",
    protect,
    allowRoles("industry"),
    getAllStudents
);

export default router;