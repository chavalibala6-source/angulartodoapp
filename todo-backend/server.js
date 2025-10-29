// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Enable CORS (before routes)
app.use(cors({
  origin: ["http://localhost:4200", "http://192.168.1.12:4200"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Parse JSON and URL-encoded bodies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// ✅ MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/todolist";
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Task model
const TaskSchema = new mongoose.Schema({
  name: String,
  content: String,
  image: String,
  completed: Boolean,
});
const Task = mongoose.model("Task", TaskSchema);

// ✅ Routes
app.get("/", (req, res) => res.send("✅ Backend is reachable"));
app.get("/api/tasks", async (req, res) => res.json(await Task.find()));
app.post("/api/tasks", async (req, res) => res.json(await new Task(req.body).save()));
app.put("/api/tasks/:id", async (req, res) =>
  res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);
app.delete("/api/tasks/:id", async (req, res) =>
  res.json(await Task.findByIdAndDelete(req.params.id))
);

// ✅ Start server
const PORT = 3000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => console.log(`🚀 Server running on http://${HOST}:${PORT}`));
