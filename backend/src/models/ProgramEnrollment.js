import mongoose from "mongoose";

const programEnrollmentSchema = new mongoose.Schema({
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LearningProgram",
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    industry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Enrolled", "Completed", "Dropped"],
        default: "Enrolled"
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Prevent a student from enrolling in the same program multiple times
programEnrollmentSchema.index({ program: 1, student: 1 }, { unique: true });

const ProgramEnrollment = mongoose.model("ProgramEnrollment", programEnrollmentSchema);

export default ProgramEnrollment;
