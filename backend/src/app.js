import express from "express";
import cors from "cors";
import profileRoutes from "./routes/profileRoutes.js";
import authRoutes from "./routes/authRoutes.js";

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


export default app;