import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import collaborationRoutes from "./src/routes/historyRoutes";

dotenv.config();

const app = express();

// Allow JSON data in the request body to be parsed
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Allow URL-encoded data in the request body to be parsed
app.use(express.urlencoded({ extended: false }));

// Use the collaboration router to handle requests at http://localhost:5002/history
app.use("/history", collaborationRoutes);

app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// Set the server to listen on a specific port
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server is running on http://history-service:${PORT}`);
});

export default app;
