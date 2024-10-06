import express, { Request, Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import router from "./routes/question-route";
import connectDB from './config/db';

// Load environment variables from the .env file
dotenv.config();

// Initialize connection to MongoDB
connectDB();

// Initialize the Express.js application
const app = express();

// Allow cross-origin requests from your frontend at http://localhost:3000
app.use(cors());

// Allow JSON data in the request body to be parsed
app.use(express.json());

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

// Use the question router to handle requests at http://localhost:8080/api/questions
app.use('/api/questions', router);

// Define the port the application will run on
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

export default app;
