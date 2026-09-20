import CollegeProfile from "../models/CollegeProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";
import User from "../models/User.js";

// @desc    Get dashboard statistics for the college
// @route   GET /api/college/stats
// @access  Private (College only)
export const getDashboardStats = async (req, res) => {
    try {
        const collegeProfile = await CollegeProfile.findOne({ user: req.user.userId });
        if (!collegeProfile) {
            return res.status(200).json({
                stats: { totalStudents: 0, completedProfiles: 0, activeOpportunities: 0, totalApplications: 0, pendingApplications: 0 }
            });
        }

        // Find students associated with this college
        const students = await StudentProfile.find({ college: collegeProfile.collegeName });
        const studentIds = students.map(s => s.user); // Get the User ObjectIds

        // Calculate completed profiles (just an example condition: bio and skills exist)
        const completedProfiles = students.filter(s => s.bio && s.skills && s.skills.length > 0).length;

        // Find applications by these students
        const applications = await Application.find({ student: { $in: studentIds } });
        const pendingApplications = applications.filter(a => a.status === "Applied" || a.status === "Under Review").length;

        // Find active opportunities
        const activeOpportunities = await Opportunity.countDocuments({ status: "published" });

        res.status(200).json({
            stats: {
                totalStudents: students.length,
                completedProfiles,
                activeOpportunities,
                totalApplications: applications.length,
                pendingApplications
            }
        });
    } catch (error) {
        console.error("Error fetching college stats:", error);
        res.status(500).json({ message: "Server error while fetching stats" });
    }
};

// @desc    Get all students for the college
// @route   GET /api/college/students
// @access  Private (College only)
export const getStudents = async (req, res) => {
    try {
        const collegeProfile = await CollegeProfile.findOne({ user: req.user.userId });
        if (!collegeProfile) {
            return res.status(200).json({ students: [] });
        }

        // We populate user to get name and email
        const students = await StudentProfile.find({ college: collegeProfile.collegeName }).populate("user", "name email");

        // We also want application counts.
        // We can aggregate or just query in a loop since this is MVP
        const result = await Promise.all(students.map(async (student) => {
            const count = await Application.countDocuments({ student: student.user._id });
            const doc = student.toObject();
            doc.applicationCount = count;
            // Determine profile completion %
            let completeCount = 0;
            if (student.bio) completeCount++;
            if (student.skills && student.skills.length > 0) completeCount++;
            if (student.course) completeCount++;
            if (student.year) completeCount++;
            doc.profileCompletion = completeCount * 25; // Simple heuristic (4 fields)
            return doc;
        }));

        res.status(200).json({ students: result });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Server error while fetching students" });
    }
};

// @desc    Get all applications made by students of the college
// @route   GET /api/college/applications
// @access  Private (College only)
export const getApplications = async (req, res) => {
    try {
        const collegeProfile = await CollegeProfile.findOne({ user: req.user.userId });
        if (!collegeProfile) {
            return res.status(200).json({ applications: [] });
        }

        const students = await StudentProfile.find({ college: collegeProfile.collegeName }).select("user");
        const studentIds = students.map(s => s.user);

        const applications = await Application.find({ student: { $in: studentIds } })
            .populate("student", "name email")
            .populate("opportunity", "title")
            .populate("company", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ applications });
    } catch (error) {
        console.error("Error fetching college applications:", error);
        res.status(500).json({ message: "Server error while fetching applications" });
    }
};

// @desc    Get college profile
// @route   GET /api/college/profile
// @access  Private (College only)
export const getProfile = async (req, res) => {
    try {
        const profile = await CollegeProfile.findOne({ user: req.user.userId }).populate("user", "name email");
        
        if (!profile) {
            const user = await User.findById(req.user.userId);
            return res.status(200).json({
                profile: null,
                user: {
                    name: user.name,
                    email: user.email
                }
            });
        }

        res.status(200).json({ profile });
    } catch (error) {
        console.error("Error fetching college profile:", error);
        res.status(500).json({ message: "Server error while fetching profile" });
    }
};

// @desc    Create or update college profile
// @route   POST /api/college/profile
// @access  Private (College only)
export const upsertProfile = async (req, res) => {
    try {
        const {
            collegeName,
            email,
            location,
            website,
            description,
            contactInfo
        } = req.body;

        const profileFields = {
            user: req.user.userId,
            collegeName,
            email,
            location,
            website,
            description,
            contactInfo
        };

        let profile = await CollegeProfile.findOne({ user: req.user.userId });

        if (profile) {
            // Update
            // Wait, we need to ensure collegeName is unique among others? The schema handles unique.
            profile = await CollegeProfile.findOneAndUpdate(
                { user: req.user.userId },
                { $set: profileFields },
                { new: true }
            );
            return res.status(200).json({ message: "Profile updated successfully", profile });
        }

        // Create
        profile = new CollegeProfile(profileFields);
        await profile.save();

        res.status(201).json({ message: "Profile created successfully", profile });
    } catch (error) {
        console.error("Error upserting college profile:", error);
        res.status(500).json({ message: "Server error while saving profile", error: error.message });
    }
};
