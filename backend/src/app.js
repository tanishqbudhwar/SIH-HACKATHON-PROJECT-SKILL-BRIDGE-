import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import assessmentRoutes from "./routes/assessmentRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import industryProfileRoutes from "./routes/industryProfileRoutes.js";
import collegeRoutes from "./routes/collegeRoutes.js";

const app = express();


// Middleware
app.use(cors());
app.use(express.json());


// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Welcome to Sanjog API"
    });
});


// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/industry-profile", industryProfileRoutes);
app.use("/api/college", collegeRoutes);


export default app;