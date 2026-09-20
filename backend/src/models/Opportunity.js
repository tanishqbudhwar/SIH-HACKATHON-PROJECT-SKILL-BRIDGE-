import mongoose from "mongoose";

const requiredSkillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    level: {
        type: String,
        required: true
    }
}, { _id: false });

const opportunitySchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    opportunityType: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    workMode: {
        type: String,
        trim: true
    },
    duration: {
        type: String,
        trim: true
    },
    positions: {
        type: Number,
        default: 1
    },
    stipend: {
        type: String,
        trim: true
    },
    deadline: {
        type: Date
    },
    experience: {
        type: String,
        trim: true
    },
    education: {
        type: String,
        trim: true
    },
    requiredSkills: [requiredSkillSchema],
    responsibilities: {
        type: String,
        trim: true
    },
    requirements: {
        type: String,
        trim: true
    },
    learningOutcomes: {
        type: String,
        trim: true
    },
    benefits: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ["published", "draft", "closed"],
        default: "published"
    }
}, { timestamps: true });

const Opportunity = mongoose.model("Opportunity", opportunitySchema);

export default Opportunity;
