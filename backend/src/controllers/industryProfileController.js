import IndustryProfile from "../models/IndustryProfile.js";
import User from "../models/User.js";

// @desc    Get current user's industry profile
// @route   GET /api/industry-profile
// @access  Private (Industry only)
export const getProfile = async (req, res) => {
    try {
        const profile = await IndustryProfile.findOne({ user: req.user.userId }).populate("user", "name email role");

        if (!profile) {
            // If profile doesn't exist yet, we can return empty or the basic user info
            const user = await User.findById(req.user.userId);
            return res.status(200).json({
                success: true,
                profile: null,
                user: {
                    name: user.name,
                    email: user.email,
                }
            });
        }

        res.status(200).json({
            success: true,
            profile,
        });
    } catch (error) {
        console.error("Error getting industry profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create or update industry profile
// @route   POST /api/industry-profile
// @access  Private (Industry only)
export const upsertProfile = async (req, res) => {
    try {
        const {
            companyName,
            email,
            description,
            industryDomain,
            website,
            location,
            companySize,
            foundedYear,
            technologies,
            about,
            opportunitiesDescription,
            contactInfo
        } = req.body;

        const profileFields = {
            user: req.user.userId,
            companyName,
            email,
            description,
            industryDomain,
            website,
            location,
            companySize,
            foundedYear,
            technologies,
            about,
            opportunitiesDescription,
            contactInfo
        };

        // Check if profile exists
        let profile = await IndustryProfile.findOne({ user: req.user.userId });

        if (profile) {
            // Update
            profile = await IndustryProfile.findOneAndUpdate(
                { user: req.user.userId },
                { $set: profileFields },
                { new: true }
            );
            return res.status(200).json({ success: true, profile });
        }

        // Create
        profile = new IndustryProfile(profileFields);
        await profile.save();

        res.status(201).json({ success: true, profile });
    } catch (error) {
        console.error("Error upserting industry profile:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
