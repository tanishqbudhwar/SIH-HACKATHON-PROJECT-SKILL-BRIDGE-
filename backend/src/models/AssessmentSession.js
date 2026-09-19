import mongoose from "mongoose";

const assessmentSessionSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ['in_progress', 'completed'],
            default: 'in_progress'
        },
        questions: [
            {
                question: String,
                topic: String,
                subtopic: String,
                options: mongoose.Schema.Types.Mixed, // Object or Array
                correctAnswer: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const AssessmentSession = mongoose.model("AssessmentSession", assessmentSessionSchema);

export default AssessmentSession;
