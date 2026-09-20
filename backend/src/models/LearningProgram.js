import mongoose from "mongoose";

const requiredSkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    level: {
        type: String,
        required: true,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    }
}, { _id: false });

const learningProgramSchema = new mongoose.Schema({
    industry: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true,
        required: true
    },
    skillCategory: {
        type: String,
        trim: true
    },
    requiredSkills: [requiredSkillSchema],
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Beginner"
    },
    duration: {
        type: String,
        trim: true,
        required: true
    },
    mode: {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        default: "Online"
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    seats: {
        type: Number,
        required: true,
        min: 1
    },
    eligibility: {
        type: String,
        trim: true
    },
    prerequisites: {
        type: String,
        trim: true
    },
    skillsGained: [{
        type: String,
        trim: true
    }],
    fee: {
        type: String,
        enum: ["Free", "Paid"],
        default: "Free"
    },
    certificateAvailable: {
        type: Boolean,
        default: true
    },
    mentor: {
        type: String,
        trim: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    learningOutcomes: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ["Draft", "Active", "Closed", "Completed"],
        default: "Active"
    }
}, { timestamps: true });

const LearningProgram = mongoose.model("LearningProgram", learningProgramSchema);

export default LearningProgram;
