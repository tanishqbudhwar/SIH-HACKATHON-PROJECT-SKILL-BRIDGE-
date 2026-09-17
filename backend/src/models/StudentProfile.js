import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,

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
        }
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