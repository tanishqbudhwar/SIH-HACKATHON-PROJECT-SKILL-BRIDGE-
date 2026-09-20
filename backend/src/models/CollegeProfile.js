import mongoose from "mongoose";

const collegeProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One profile per college user
        },
        collegeName: {
            type: String,
            required: true,
            unique: true, // College name is used to link to StudentProfiles
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        website: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        contactInfo: {
            phone: {
                type: String,
                trim: true,
            },
            department: {
                type: String,
                trim: true,
            }
        }
    },
    {
        timestamps: true,
    }
);

const CollegeProfile = mongoose.model("CollegeProfile", collegeProfileSchema);

export default CollegeProfile;
