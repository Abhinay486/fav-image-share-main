import express from 'express';
import dotenv from 'dotenv';
import connectDb from './database/db.js';
import cookieParser from 'cookie-parser';
import cloudinary from './config/cloudinary.js'; // ✅ Corrected
import path from "path";
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT ;

// Enable CORS for your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
console.log(`CORS enabled for ${process.env.FRONTEND_URL}`);
// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
import userRoutes from './routes/userRoutes.js';
import pinRoutes from './routes/pinRoutes.js';

app.use("/api/user", userRoutes);
app.use("/api/pin", pinRoutes);

// Serve frontend

// Start server
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await connectDb();
});
