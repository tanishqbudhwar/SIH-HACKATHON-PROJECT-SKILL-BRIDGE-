import Application from "../models/Application.js";

// @desc    Update application status
// @route   PATCH /api/applications/:id/status
// @access  Private (Industry only)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;

        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        // Verify the application belongs to an opportunity owned by the logged-in industry
        if (application.company.toString() !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        application.status = status;
        await application.save();

        res.json({
            message: "Status updated successfully",
            application
        });
    } catch (error) {
        console.error("Error updating application status:", error);
        res.status(500).json({
            message: "Server error while updating status",
            error: error.message
        });
    }
};

// @desc    Apply for an opportunity
// @route   POST /api/applications
// @access  Private (Student only)
export const createApplication = async (req, res) => {
    try {
        const { opportunityId } = req.body;

        if (!opportunityId) {
            return res.status(400).json({ message: "Opportunity ID is required" });
        }

        // Import here to avoid circular dependency if any, or better, we already have Application model
        // Wait, we need Opportunity model
        const { default: Opportunity } = await import("../models/Opportunity.js");
        
        const opportunity = await Opportunity.findById(opportunityId);
        if (!opportunity) {
            return res.status(404).json({ message: "Opportunity not found" });
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({
            student: req.user.userId,
            opportunity: opportunityId
        });

        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this opportunity" });
        }

        const application = await Application.create({
            student: req.user.userId,
            opportunity: opportunityId,
            company: opportunity.company,
            status: "Applied"
        });

        res.status(201).json({
            message: "Application submitted successfully",
            application
        });
    } catch (error) {
        console.error("Error creating application:", error);
        res.status(500).json({
            message: "Server error while creating application",
            error: error.message
        });
    }
};

// @desc    Get logged-in student's applications
// @route   GET /api/applications/my
// @access  Private (Student only)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ student: req.user.userId })
            .populate({
                path: "opportunity",
                populate: {
                    path: "company",
                    select: "name profileImage"
                }
            })
            .populate("company", "name")
            .sort("-createdAt");

        res.json(applications);
    } catch (error) {
        console.error("Error fetching my applications:", error);
        res.status(500).json({
            message: "Server error while fetching applications",
            error: error.message
        });
    }
};
// @desc    Get logged-in industry user's applications
// @route   GET /api/applications/industry
// @access  Private (Industry only)
export const getIndustryApplications = async (req, res) => {
    try {
        const applications = await Application.find({ company: req.user.userId })
            .populate("student", "name email")
            .populate("opportunity", "title type")
            .sort({ createdAt: -1 });

        res.status(200).json({
            applications
        });
    } catch (error) {
        console.error("Error fetching industry applications:", error);
        res.status(500).json({
            message: "Server error while fetching applications",
            error: error.message
        });
    }
};
