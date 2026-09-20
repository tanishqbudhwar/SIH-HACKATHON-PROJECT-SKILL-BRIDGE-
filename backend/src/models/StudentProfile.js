import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,

        },

        profilePic: {
            type: String // Will store Base64 encoded image
        },

        college: {
            type: String,
            trim: true
        },

        course: {
            type: String,
            trim: true
        },

        year: {
            type: Number
        },

        skills: [
            {
                type: String,
                trim: true
            }
        ],

        bio: {
            type: String,
            trim: true
        },

        skillScore: {
            type: Number,
            default: 0
        },

        internshipsApplied: {
            type: Number,
            default: 0
        },

        placementReadiness: {
            type: Number,
            default: 0
        },

        certificates: {
            type: Number,
            default: 0
        },

        skillGapAnalysis: [
            {
                skill: String,
                studentLevel: Number,
                industryRequirement: Number
            }
        ],

        skillsToImprove: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
);

const StudentProfile = mongoose.model(
    "StudentProfile",
    studentProfileSchema
);

export default StudentProfile;