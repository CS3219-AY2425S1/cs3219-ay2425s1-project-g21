import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import collaborationRoutes from "./src/routes/collaborationRoutes";

dotenv.config();

const app = express();

// Allow cross-origin requests from your frontend at http://localhost:3000
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Allow JSON data in the request body to be parsed
app.use(express.json());

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

// Use the collaboration router to handle requests at http://localhost:5001/room
app.use("/room", collaborationRoutes);

// Set the server to listen on a specific port
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on http://collaboration-service:${PORT}`);
});

export default app;
