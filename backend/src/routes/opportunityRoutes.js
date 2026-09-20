import express from "express";
import { 
    publishOpportunity, 
    getPublishedOpportunities,
    getMyOpportunities,
    getOpportunityApplicants,
    applyToOpportunity,
    updateOpportunity
} from "../controllers/opportunityController.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/opportunities - public/students to view published ones
router.get("/", protect, getPublishedOpportunities);

// GET /api/opportunities/my - Industry users to see their own
router.get("/my", protect, allowRoles("industry"), getMyOpportunities);

// POST /api/opportunities - Industry users to publish
router.post("/", protect, allowRoles("industry"), publishOpportunity);

// GET /api/opportunities/:id/applicants - Industry sees applicants
router.get("/:id/applicants", protect, allowRoles("industry"), getOpportunityApplicants);

// POST /api/opportunities/:id/apply - Student applies
router.post("/:id/apply", protect, allowRoles("student"), applyToOpportunity);

// PATCH /api/opportunities/:id - Industry updates
router.patch("/:id", protect, allowRoles("industry"), updateOpportunity);

export default router;
