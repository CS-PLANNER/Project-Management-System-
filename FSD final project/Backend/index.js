// ================= EMERGENCY FIX - BACKEND INDEX.JS =================
// This version has enhanced error handling for the specific issues you're facing

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// ================= INITIALIZE =================
const app = express();

// ================= MIDDLEWARE (MUST BE BEFORE ROUTES) =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ================= MONGODB CONNECTION =================
const MONGODB_URI = "mongodb+srv://PMS:PMS2026@pms.7ioxyan.mongodb.net/project?retryWrites=true&w=majority";

mongoose.set('strictQuery', false);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected to project database");
    createDefaultAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

// ================= MODELS (LOAD AFTER CONNECTION) =================
let projectModel, userModel, taskModel, sprintModel, dailyTaskModel;

// Delay model loading to ensure connection is ready
setTimeout(() => {
  try {
    projectModel = require("./model/project");
    userModel = require("./model/user");
    taskModel = require("./model/task");
    sprintModel = require("./model/sprint");
    dailyTaskModel = require("./model/dailyplanner");
    console.log("✅ Models loaded successfully");
  } catch (error) {
    console.error("❌ Error loading models:", error.message);
  }
}, 1000);

// Create default admin user
async function createDefaultAdmin() {
  try {
    // Wait for models to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!userModel) {
      console.log("⚠️  User model not loaded yet, skipping admin creation");
      return;
    }
    
    console.log("🔍 Checking for admin user...");
    const adminExists = await userModel.findOne({ email: "admin@example.com" });
    
    if (!adminExists) {
      console.log("🆕 Creating admin user...");
      const admin = await userModel.create({
        name: "Admin",
        employeeCode: "ADMIN001",
        email: "admin@example.com",
        password: "admin@123",
        role: "Admin"
      });
      console.log("✅ Admin created with ID:", admin._id);
    } else {
      console.log("✅ Admin already exists");
    }
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
  }
}

// ================= TEST ROUTES =================
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "OK", 
    message: "Backend is running",
    database: mongoose.connection.db?.databaseName || "Not connected",
    mongoStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/debug/db", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ error: "MongoDB not connected" });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const counts = {};
    for (let name of collectionNames) {
      counts[name] = await mongoose.connection.db.collection(name).countDocuments();
    }
    
    res.json({
      database: mongoose.connection.db.databaseName,
      collections: collectionNames,
      counts: counts,
      status: "Connected"
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("🔐 Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ 
        message: "User not found. Use: admin@example.com"
      });
    }
    
    if (user.password === password) {
      console.log("✅ Login successful for:", user.name);
      return res.json({
        message: "Logged in successfully",
        userType: user.role,
        role: user.role,
        name: user.name,
        email: user.email,
        userId: user._id,
        employeeCode: user.employeeCode
      });
    } else {
      console.log("❌ Password mismatch");
      return res.status(401).json({ 
        message: "Invalid password"
      });
    }
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ 
      message: "Login failed",
      error: error.message 
    });
  }
});

// ================= PROJECT MANAGEMENT =================

app.post("/projects/add", async (req, res) => {
  try {
    if (!projectModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("📝 Creating project:", req.body.name);
    const project = await projectModel.create(req.body);
    console.log("✅ Project created:", project._id);
    res.json({ message: "Project added successfully!", project });
  } catch (error) {
    console.error("❌ Error adding project:", error);
    res.status(500).json({ message: "Error adding project", error: error.message });
  }
});

app.get("/projects", async (req, res) => {
  try {
    if (!projectModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const projects = await projectModel.find();
    console.log(`📋 Fetched ${projects.length} projects`);
    res.json(projects);
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error: error.message });
  }
});

app.get("/projects/:id", async (req, res) => {
  try {
    if (!projectModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }
    
    const project = await projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    console.error("❌ Error fetching project:", error);
    res.status(500).json({ message: "Error fetching project", error: error.message });
  }
});

app.put("/projects/update/:id", async (req, res) => {
  try {
    if (!projectModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }
    
    const updated = await projectModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log("✅ Project updated:", req.params.id);
    res.json({ message: "Project updated successfully", project: updated });
  } catch (error) {
    console.error("❌ Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error: error.message });
  }
});

app.delete("/projects/delete/:id", async (req, res) => {
  try {
    if (!projectModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid project ID format" });
    }
    
    const deleted = await projectModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    console.log("🗑️ Project deleted:", req.params.id);
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project", error: error.message });
  }
});

// ================= USER MANAGEMENT =================

app.get("/users", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const users = await userModel.find({}, { password: 0 });
    console.log(`👥 Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

app.post("/users/add", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const { name, employeeCode, email, password, role } = req.body;
    
    console.log("👤 Creating user:", email);
    
    const existingUser = await userModel.findOne({ $or: [{ email }, { employeeCode }] });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email or employee code already exists" });
    }
    
    const newUser = await userModel.create({
      name,
      employeeCode,
      email,
      password,
      role
    });
    
    console.log("✅ User created:", newUser._id);
    res.json({ 
      message: "User created successfully", 
      user: { ...newUser._doc, password: undefined }
    });
  } catch (error) {
    console.error("❌ Error adding user:", error);
    res.status(500).json({ message: "Error adding user", error: error.message });
  }
});

app.put("/users/update/:id", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("✅ User updated:", req.params.id);
    res.json({ message: "User updated successfully", user: { ...updated._doc, password: undefined } });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
});

app.delete("/users/delete/:id", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const deleted = await userModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log("🗑️ User deleted:", req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
});

// ================= TASK MANAGEMENT =================

app.post("/tasks/add", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("✏️ Creating task:", req.body.title);
    const task = await taskModel.create(req.body);
    console.log("✅ Task created:", task._id);
    res.json({ message: "Task added successfully", task });
  } catch (error) {
    console.error("❌ Error adding task:", error);
    res.status(500).json({ message: "Error adding task", error: error.message });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const tasks = await taskModel.find()
      .populate('sprintId', 'sprintName')
      .populate('projectId', 'name');
    console.log(`📝 Fetched ${tasks.length} tasks`);
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

app.get("/tasks/sprint/:sprintId", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const tasks = await taskModel.find({ sprintId: req.params.sprintId })
      .populate('assignedTo', 'name employeeCode role');
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

app.get("/tasks/project/:projectId", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const tasks = await taskModel.find({ projectId: req.params.projectId })
      .populate('sprintId', 'sprintName')
      .populate('assignedTo', 'name employeeCode role');
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

app.put("/tasks/update/:id", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    
    const updated = await taskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log("✅ Task updated:", req.params.id);
    res.json({ message: "Task updated successfully", task: updated });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
});

app.delete("/tasks/delete/:id", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    
    const deleted = await taskModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    console.log("🗑️ Task deleted:", req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting task:", error);
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
});

// ================= SPRINT MANAGEMENT =================

app.post("/sprints/add", async (req, res) => {
  try {
    if (!sprintModel) {
      console.error("⚠️  Sprint model not loaded!");
      return res.status(503).json({ 
        message: "Server is still initializing. Please wait a moment and try again.",
        modelStatus: "not loaded"
      });
    }
    
    console.log("🏃 Creating sprint:", req.body.sprintName);
    console.log("📦 Sprint data:", JSON.stringify(req.body, null, 2));
    
    const sprint = await sprintModel.create(req.body);
    console.log("✅ Sprint created successfully:", sprint._id);
    
    res.json({ 
      message: "Sprint added successfully!", 
      sprint: sprint 
    });
  } catch (error) {
    console.error("❌ Error adding sprint:", error);
    console.error("❌ Error stack:", error.stack);
    
    res.status(500).json({ 
      message: "Error adding sprint", 
      error: error.message,
      details: error.toString()
    });
  }
});

app.get("/sprints", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const sprints = await sprintModel.find().populate('assignedUsers', 'name employeeCode role');
    console.log(`🏃 Fetched ${sprints.length} sprints`);
    res.json(sprints);
  } catch (error) {
    console.error("❌ Error fetching sprints:", error);
    res.status(500).json({ message: "Error fetching sprints", error: error.message });
  }
});

app.get("/sprints/:id", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid sprint ID format" });
    }
    
    const sprint = await sprintModel.findById(req.params.id).populate('assignedUsers', 'name employeeCode role');
    if (!sprint) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    res.json(sprint);
  } catch (error) {
    console.error("❌ Error fetching sprint:", error);
    res.status(500).json({ message: "Error fetching sprint", error: error.message });
  }
});

app.put("/sprints/update/:id", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid sprint ID format" });
    }
    
    const updated = await sprintModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    console.log("✅ Sprint updated:", req.params.id);
    res.json({ message: "Sprint updated successfully", sprint: updated });
  } catch (error) {
    console.error("❌ Error updating sprint:", error);
    res.status(500).json({ message: "Error updating sprint", error: error.message });
  }
});

app.delete("/sprints/delete/:id", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid sprint ID format" });
    }
    
    const deleted = await sprintModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Sprint not found" });
    }
    console.log("🗑️ Sprint deleted:", req.params.id);
    res.json({ message: "Sprint deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting sprint:", error);
    res.status(500).json({ message: "Error deleting sprint", error: error.message });
  }
});

// ================= DAILY TASK MANAGEMENT =================

app.post("/daily-tasks/add", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("📅 Creating daily task:", req.body.taskName);
    const dailyTask = await dailyTaskModel.create(req.body);
    console.log("✅ Daily task created:", dailyTask._id);
    res.json({ message: "Daily task added successfully!", dailyTask });
  } catch (error) {
    console.error("❌ Error adding daily task:", error);
    res.status(500).json({ message: "Error adding daily task", error: error.message });
  }
});

app.get("/daily-tasks", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const dailyTasks = await dailyTaskModel.find()
      .populate('taskId', 'title')
      .populate('assignedUsers', 'name employeeCode role');
    console.log(`📅 Fetched ${dailyTasks.length} daily tasks`);
    res.json(dailyTasks);
  } catch (error) {
    console.error("❌ Error fetching daily tasks:", error);
    res.status(500).json({ message: "Error fetching daily tasks", error: error.message });
  }
});

app.get("/daily-tasks/:id", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid daily task ID format" });
    }
    
    const dailyTask = await dailyTaskModel.findById(req.params.id)
      .populate('taskId', 'title')
      .populate('assignedUsers', 'name employeeCode role');
    if (!dailyTask) {
      return res.status(404).json({ message: "Daily task not found" });
    }
    res.json(dailyTask);
  } catch (error) {
    console.error("❌ Error fetching daily task:", error);
    res.status(500).json({ message: "Error fetching daily task", error: error.message });
  }
});

app.put("/daily-tasks/update/:id", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid daily task ID format" });
    }
    
    const updated = await dailyTaskModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Daily task not found" });
    }
    console.log("✅ Daily task updated:", req.params.id);
    res.json({ message: "Daily task updated successfully", dailyTask: updated });
  } catch (error) {
    console.error("❌ Error updating daily task:", error);
    res.status(500).json({ message: "Error updating daily task", error: error.message });
  }
});

app.delete("/daily-tasks/delete/:id", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid daily task ID format" });
    }
    
    const deleted = await dailyTaskModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Daily task not found" });
    }
    console.log("🗑️ Daily task deleted:", req.params.id);
    res.json({ message: "Daily task deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting daily task:", error);
    res.status(500).json({ message: "Error deleting daily task", error: error.message });
  }
});

// ================= ERROR HANDLING =================

// 404 handler - MUST BE BEFORE error middleware
app.use((req, res, next) => {
  console.log(`⚠️  404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /api/health",
      "GET /api/debug/db",
      "POST /login",
      "GET /projects",
      "POST /sprints/add",
      "GET /sprints",
      "etc..."
    ]
  });
});

// Error handling middleware - MUST BE LAST
app.use((err, req, res, next) => {
  console.error("🔥 Unhandled error:", err);
  console.error("Stack:", err.stack);
  
  res.status(500).json({ 
    message: "Internal server error", 
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ================= SERVER =================
const PORT = 3008;
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 Server running on http://localhost:" + PORT);
  console.log("=".repeat(60));
  console.log("📡 Endpoints ready:");
  console.log(`   🔐 Login:  http://localhost:${PORT}/login`);
  console.log(`   ❤️  Health: http://localhost:${PORT}/api/health`);
  console.log(`   🔍 Debug:  http://localhost:${PORT}/api/debug/db`);
  console.log("=".repeat(60) + "\n");
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
  });
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});