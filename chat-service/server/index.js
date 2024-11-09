const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const verifyJWT = require("../middleware/authMiddleware.js");

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON bodies

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Apply the JWT verification middleware
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  verifyJWT(token)
    .then((userData) => {
      req.userData = userData; // Attach user data to the request
      next();
    })
    .catch((err) => {
      return res.status(401).send(err.message);
    });
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join_room", (data) => {
    const { roomId, userId } = data; // Expecting userId to be sent when joining
    socket.join(roomId);
    socket.userId = userId; // Store user ID in the socket instance
    console.log(`User ${userId} joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    const userID = socket.userId; // Access the stored user ID
    io.to(data.roomId).emit("receive_message", {
      ...data,
      author: userID, // Use the stored user ID
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(4000, () => {
  console.log("Chat service running on port 4000");
});
