import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import collaborationRoutes from "./src/routes/historyRoutes";

dotenv.config();

const app = express();

// Allow JSON data in the request body to be parsed
app.use(express.json());
// Allow cross-origin requests from your frontend at http://localhost:3000
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

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

// Use the collaboration router to handle requests at http://localhost:5002/history
app.use("/history", collaborationRoutes);

// Set the server to listen on a specific port
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on http://history-service:${PORT}`);
});

export default app;
