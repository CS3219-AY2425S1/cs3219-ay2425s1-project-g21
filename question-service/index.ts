import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/question-route";
import connectDB from "./config/db";

// Load environment variables from the .env file
dotenv.config();

// Initialize connection to MongoDB
connectDB();

// Initialize the Express.js application
const app = express();

// Allow cross-origin requests from your frontend at http://localhost:3000
app.use(cors());
app.options("*", cors());

// Allow JSON data in the request body to be parsed
app.use(express.json());

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    return res.status(200).json({});
  }

  // Continue Route Processing
  next();
});

// Use the question router to handle requests at http://localhost:8080/api/questions
app.use("/api/questions", router);

// Define the port the application will run on
const PORT = process.env.PORT || 8080;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

export default app;
