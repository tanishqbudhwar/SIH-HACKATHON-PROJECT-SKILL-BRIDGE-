import mongoose from "mongoose";

const assessmentResultSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        skill: {
            type: String,
            required: true
        },
        totalQuestions: {
            type: Number,
            required: true
        },
        correctAnswers: {
            type: Number,
            required: true
        },
        incorrectAnswers: {
            type: Number,
            required: true
        },
        score: {
            type: Number, // Percentage 0-100
            required: true
        },
        status: {
            type: String, // e.g. "Developing", "Proficient", "Expert"
            required: true
        },
        skillBreakdown: [
            {
                topic: String,
                total: Number,
                correct: Number,
                percentage: Number
            }
        ],
        plusPoints: [
            {
                type: String
            }
        ],
        minorPoints: [
            {
                type: String
            }
        ],
        recommendations: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const AssessmentResult = mongoose.model("AssessmentResult", assessmentResultSchema);

export default AssessmentResult;
