import express from "express";
import { generateQuestions, submitAssessment, getLatestResult, getHistory } from "../controllers/assessmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/generate", protect, generateQuestions);
router.post("/submit", protect, submitAssessment);
router.get("/latest", protect, getLatestResult);
router.get("/history", protect, getHistory);

export default router;
