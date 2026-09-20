import LearningProgram from "../models/LearningProgram.js";
import ProgramEnrollment from "../models/ProgramEnrollment.js";

// @desc    Create a new learning program
// @route   POST /api/programs
// @access  Private (Industry only)
export const createProgram = async (req, res) => {
    try {
        const {
            title,
            shortDescription,
            description,
            skillCategory,
            requiredSkills,
            difficulty,
            duration,
            mode,
            startDate,
            endDate,
            seats,
            eligibility,
            prerequisites,
            skillsGained,
            fee,
            certificateAvailable,
            mentor,
            registrationDeadline,
            learningOutcomes,
            benefits
        } = req.body;

        if (!title || !description || !startDate || !endDate || !seats || !registrationDeadline) {
            return res.status(400).json({ message: "Please provide all required fields" });
        }

        const program = await LearningProgram.create({
            industry: req.user.userId, // authenticated user
            title,
            shortDescription,
            description,
            skillCategory,
            requiredSkills,
            difficulty,
            duration,
            mode,
            startDate,
            endDate,
            seats,
            eligibility,
            prerequisites,
            skillsGained,
            fee,
            certificateAvailable,
            mentor,
            registrationDeadline,
            learningOutcomes,
            benefits,
            status: "Active"
        });

        res.status(201).json({
            message: "Learning program created successfully",
            program
        });
    } catch (error) {
        console.error("Error creating program:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get programs created by current industry user
// @route   GET /api/programs/my
// @access  Private (Industry only)
export const getMyPrograms = async (req, res) => {
    try {
        const programs = await LearningProgram.find({ industry: req.user.userId })
            .sort({ createdAt: -1 })
            .lean();

        // Attach enrollment counts
        const programsWithCounts = await Promise.all(
            programs.map(async (prog) => {
                const enrolledCount = await ProgramEnrollment.countDocuments({ program: prog._id });
                return { ...prog, enrolledCount };
            })
        );

        res.json({ programs: programsWithCounts });
    } catch (error) {
        console.error("Error fetching my programs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get published active programs
// @route   GET /api/programs
// @access  Private (Student)
export const getPublishedPrograms = async (req, res) => {
    try {
        // Find Active programs where deadline hasn't passed
        const programs = await LearningProgram.find({ 
            status: "Active" 
            // In a real app we might also filter by registrationDeadline >= new Date()
        }).populate("industry", "name").sort({ createdAt: -1 }).lean();

        // Attach enrollment counts so students see if seats are full
        const programsWithCounts = await Promise.all(
            programs.map(async (prog) => {
                const enrolledCount = await ProgramEnrollment.countDocuments({ program: prog._id });
                return { ...prog, enrolledCount };
            })
        );

        res.json({ programs: programsWithCounts });
    } catch (error) {
        console.error("Error fetching published programs:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Enroll in a program
// @route   POST /api/programs/:id/enroll
// @access  Private (Student)
export const enrollInProgram = async (req, res) => {
    try {
        const programId = req.params.id;
        const studentId = req.user.userId;

        const program = await LearningProgram.findById(programId);
        if (!program) {
            return res.status(404).json({ message: "Program not found" });
        }

        if (program.status !== "Active") {
            return res.status(400).json({ message: "This program is not accepting enrollments." });
        }

        // Check capacity
        const enrolledCount = await ProgramEnrollment.countDocuments({ program: programId });
        if (enrolledCount >= program.seats) {
            return res.status(400).json({ message: "Program is full. No seats available." });
        }

        // Check if already enrolled
        const existing = await ProgramEnrollment.findOne({ program: programId, student: studentId });
        if (existing) {
            return res.status(400).json({ message: "You are already enrolled in this program." });
        }

        const enrollment = await ProgramEnrollment.create({
            program: programId,
            student: studentId,
            industry: program.industry,
            status: "Enrolled"
        });

        res.status(201).json({ message: "Successfully enrolled in program", enrollment });
    } catch (error) {
        console.error("Error enrolling in program:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get enrolled students for a program
// @route   GET /api/programs/:id/students
// @access  Private (Industry only)
export const getProgramStudents = async (req, res) => {
    try {
        const programId = req.params.id;

        // Verify program ownership
        const program = await LearningProgram.findOne({ _id: programId, industry: req.user.userId });
        if (!program) {
            return res.status(404).json({ message: "Program not found or unauthorized" });
        }

        const enrollments = await ProgramEnrollment.find({ program: programId })
            .populate('student', 'name email')
            .sort({ enrolledAt: -1 })
            .lean();

        const mongoose = await import("mongoose");
        const StudentProfile = mongoose.default.model("StudentProfile");

        const enrollmentsWithProfiles = await Promise.all(
            enrollments.map(async (enr) => {
                const profile = await StudentProfile.findOne({ user: enr.student._id }).lean();
                return {
                    ...enr,
                    profile: profile || {}
                };
            })
        );

        res.json({ students: enrollmentsWithProfiles });
    } catch (error) {
        console.error("Error fetching enrolled students:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update program status (e.g. Close it)
// @route   PATCH /api/programs/:id/status
// @access  Private (Industry only)
export const updateProgramStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const programId = req.params.id;

        const program = await LearningProgram.findOneAndUpdate(
            { _id: programId, industry: req.user.userId },
            { status },
            { new: true }
        );

        if (!program) {
            return res.status(404).json({ message: "Program not found or unauthorized" });
        }

        res.json({ message: "Status updated", program });
    } catch (error) {
        console.error("Error updating program status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
