import dotenv from "dotenv";

dotenv.config();

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 4000;

const startServer = async () => {

    await connectDB();

    app.listen(PORT, () => {
        console.log(`Sanjog server running on port ${PORT}`);
    });
};

startServer();