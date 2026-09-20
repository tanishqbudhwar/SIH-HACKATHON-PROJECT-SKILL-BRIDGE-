import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";

// @desc    Publish a new opportunity
// @route   POST /api/opportunities
// @access  Private (Industry only)
export const publishOpportunity = async (req, res) => {
    try {
        const {
            opportunityType,
            title,
            companyName,
            shortDescription,
            description,
            location,
            workMode,
            duration,
            positions,
            stipend,
            deadline,
            experience,
            education,
            requiredSkills,
            responsibilities,
            requirements,
            learningOutcomes,
            benefits
        } = req.body;

        // Validation
        if (!opportunityType || !title || !description || !companyName) {
            return res.status(400).json({
                message: "Please provide all required fields: type, title, company name, description"
            });
        }

        if (!requiredSkills || requiredSkills.length === 0) {
            return res.status(400).json({
                message: "Please provide at least one required skill"
            });
        }

        const opportunity = await Opportunity.create({
            company: req.user.userId, // From protect middleware
            opportunityType,
            title,
            companyName,
            shortDescription,
            description,
            location,
            workMode,
            duration,
            positions,
            stipend,
            deadline,
            experience,
            education,
            requiredSkills,
            responsibilities,
            requirements,
            learningOutcomes,
            benefits,
            status: "published"
        });

        res.status(201).json({
            message: "Opportunity published successfully",
            opportunity
        });
    } catch (error) {
        console.error("Error publishing opportunity:", error);
        res.status(500).json({
            message: "Server error while publishing opportunity",
            error: error.message
        });
    }
};

// @desc    Get published opportunities
// @route   GET /api/opportunities
// @access  Private (Students, etc.)
export const getPublishedOpportunities = async (req, res) => {
    try {
        const { status } = req.query;
        
        // Build query, default to published
        const query = {};
        if (status) {
            query.status = status;
        } else {
            query.status = "published";
        }

        const opportunities = await Opportunity.find(query).sort({ createdAt: -1 });

        res.json({
            opportunities
        });
    } catch (error) {
        console.error("Error fetching opportunities:", error);
        res.status(500).json({
            message: "Server error while fetching opportunities",
            error: error.message
        });
    }
};

// @desc    Get opportunities created by current industry user (with applicant count)
// @route   GET /api/opportunities/my
// @access  Private (Industry only)
export const getMyOpportunities = async (req, res) => {
    try {
        const opportunities = await Opportunity.find({ company: req.user.userId }).sort({ createdAt: -1 }).lean();

        // Attach applicant counts
        const opportunitiesWithCounts = await Promise.all(
            opportunities.map(async (opp) => {
                const applicantsCount = await Application.countDocuments({ opportunity: opp._id });
                return { ...opp, applicantsCount };
            })
        );

        res.json({
            opportunities: opportunitiesWithCounts
        });
    } catch (error) {
        console.error("Error fetching my opportunities:", error);
        res.status(500).json({
            message: "Server error while fetching my opportunities",
            error: error.message
        });
    }
};

// @desc    Get applicants for a specific opportunity
// @route   GET /api/opportunities/:id/applicants
// @access  Private (Industry only)
export const getOpportunityApplicants = async (req, res) => {
    try {
        const opportunityId = req.params.id;

        // Verify the opportunity exists and belongs to the logged in user
        const opportunity = await Opportunity.findOne({ _id: opportunityId, company: req.user.userId });
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found or unauthorized" });
        }

        // Fetch applications and populate the student details and profile
        const applications = await Application.find({ opportunity: opportunityId })
            .populate('student', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        // Also fetch student profiles for these applications manually 
        // to attach skills, college, course
        const mongoose = await import("mongoose");
        const StudentProfile = mongoose.default.model("StudentProfile");

        const applicationsWithProfiles = await Promise.all(
            applications.map(async (app) => {
                const profile = await StudentProfile.findOne({ user: app.student._id }).lean();
                return {
                    ...app,
                    profile: profile || {}
                };
            })
        );

        res.json({ applications: applicationsWithProfiles });
    } catch (error) {
        console.error("Error fetching applicants:", error);
        res.status(500).json({
            message: "Server error while fetching applicants",
            error: error.message
        });
    }
};

// @desc    Apply to an opportunity
// @route   POST /api/opportunities/:id/apply
// @access  Private (Student only)
export const applyToOpportunity = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        const studentId = req.user.userId; // user must be a student

        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({ student: studentId, opportunity: opportunityId });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied to this opportunity" });
        }

        // Create application
        const application = await Application.create({
            student: studentId,
            opportunity: opportunityId,
            company: opportunity.company,
            status: "Applied"
        });

        res.status(201).json({ message: "Application submitted successfully", application });
    } catch (error) {
        console.error("Error applying to opportunity:", error);
        res.status(500).json({
            message: "Server error while submitting application",
            error: error.message
        });
    }
};

// @desc    Update an opportunity
// @route   PATCH /api/opportunities/:id
// @access  Private (Industry only)
export const updateOpportunity = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        
        // Find and update if the user is the owner
        const opportunity = await Opportunity.findOneAndUpdate(
            { _id: opportunityId, company: req.user.userId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found or unauthorized" });
        }

        res.json({ message: "Opportunity updated", opportunity });
    } catch (error) {
        console.error("Error updating opportunity:", error);
        res.status(500).json({ message: "Server error while updating", error: error.message });
    }
};
