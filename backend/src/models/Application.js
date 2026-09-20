import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    opportunity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Opportunity",
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"],
        default: "Applied"
    },
    matchPercentage: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
