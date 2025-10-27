// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ✅ Middleware

app.use(cors()); // allow cross-origin requests
//app.use(express.json()); // parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ MongoDB connection
const MONGO_URI = "mongodb://127.0.0.1:27017/todolist"; // or replace with LAN IP if needed
app.use(cors());
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Define Task schema and model
const TaskSchema = new mongoose.Schema({
  name: String,
  content: String,
  image: String,
  completed: Boolean,
});

const Task = mongoose.model("Task", TaskSchema);

// ✅ Routes

// Test route to confirm server is running
app.get("/", (req, res) => {
  res.send("✅ Backend is reachable");
});

// Get all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add a new task
app.post("/api/tasks", async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update task
app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete task
app.delete("/api/tasks/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Start server on all network interfaces (LAN accessible)
const PORT = 3000;
const HOST = "0.0.0.0"; // accept connections from LAN
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
