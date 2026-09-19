import StudentProfile from "../models/StudentProfile.js";

const createProfile = async (req, res) => {
    try {
        const { 
            college, 
            course, 
            year, 
            skills, 
            bio,
            skillScore,
            internshipsApplied,
            placementReadiness,
            certificates,
            skillGapAnalysis,
            skillsToImprove
        } = req.body;

        const existingProfile = await StudentProfile.findOne({
            user: req.user.userId
        });

        if (existingProfile) {
            return res.status(400).json({
                message: "Profile already exists"
            });
        }

        const profile = await StudentProfile.create({
            user: req.user.userId,
            college,
            course,
            year,
            skills,
            bio,
            skillScore: skillScore || 78,
            internshipsApplied: internshipsApplied || 12,
            placementReadiness: placementReadiness || 84,
            certificates: certificates || 5,
            skillGapAnalysis: skillGapAnalysis || [
                { skill: "Python", studentLevel: 90, industryRequirement: 90 },
                { skill: "Java", studentLevel: 60, industryRequirement: 60 },
                { skill: "SQL", studentLevel: 60, industryRequirement: 60 },
                { skill: "React", studentLevel: 30, industryRequirement: 30 },
                { skill: "DSA", studentLevel: 80, industryRequirement: 80 },
                { skill: "Git", studentLevel: 80, industryRequirement: 80 }
            ],
            skillsToImprove: skillsToImprove || ["React", "DSA", "Java"]
        });

        res.status(201).json({
            message: "Student profile created successfully",
            profile
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({
            user: req.user.userId
        }).populate("user", "name email role");

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        res.status(200).json({
            profile
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
};

export {
    createProfile,
    getProfile
};