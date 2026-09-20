import mongoose from "mongoose";

const industryProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One profile per industry user
        },
        companyName: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        industryDomain: {
            type: String,
        },
        website: {
            type: String,
        },
        location: {
            type: String,
        },
        companySize: {
            type: String,
        },
        foundedYear: {
            type: Number,
        },
        technologies: {
            type: [String],
            default: [],
        },
        about: {
            type: String,
        },
        opportunitiesDescription: {
            type: String, // E.g., short summary of what internships they offer
        },
        contactInfo: {
            phone: {
                type: String,
            },
            address: {
                type: String,
            },
        },
    },
    {
        timestamps: true,
    }
);

const IndustryProfile = mongoose.model("IndustryProfile", industryProfileSchema);

export default IndustryProfile;
