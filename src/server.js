// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/enroll", require("./routes/enrollRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // Replace "*" with your frontend domain in production
});

// Make io accessible in controllers via req.app.get("io")
app.set("io", io);

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Admin connected:", socket.id);

  // Send welcome notification
  socket.emit("notification", {
    message: "Welcome to the admin panel!",
    timestamp: new Date(),
  });

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
