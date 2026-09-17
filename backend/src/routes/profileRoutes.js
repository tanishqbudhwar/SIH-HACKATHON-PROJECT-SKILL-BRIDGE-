import express from "express";

import {
    createProfile,
    getProfile
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

export default router;