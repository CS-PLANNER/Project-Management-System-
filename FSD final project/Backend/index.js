// ================= UPDATED BACKEND WITH USER-SPECIFIC FILTERING =================

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
        message: "Invalid email or password"  // ✅ Changed message
      });
    }
    
    let isPasswordValid = false;
    
    // Try bcrypt compare first
    if (user.password.startsWith('$2')) {
      // Password is hashed, use bcrypt
      const bcrypt = require('bcrypt');
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (old users)
      isPasswordValid = user.password === password;
    }
    
    if (isPasswordValid) {
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
        message: "Invalid email or password"  // ✅ Changed message
      });
    }
  } catch (error) {
    console.error("🔥 Login error:", error);
    console.error("Error stack:", error.stack);
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

app.post("/users/add", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("👤 Creating user:", req.body.name);
    console.log("📧 Email:", req.body.email);
    console.log("🔑 Raw password (will be hashed):", req.body.password);
    
    // Create the user - password will be auto-hashed by pre-save hook
    const user = await userModel.create(req.body);
    
    console.log("✅ User created with ID:", user._id);
    console.log("✅ Hashed password:", user.password.substring(0, 30) + "...");
    
    res.json({ 
      message: "User added successfully!", 
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeCode: user.employeeCode
      }
    });
  } catch (error) {
    console.error("❌ Error adding user:", error.message);
    console.error("Full error:", error);
    
    // Handle duplicate email/employeeCode
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Email or Employee Code already exists" 
      });
    }
    
    res.status(500).json({ 
      message: "Error adding user", 
      error: error.message
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const users = await userModel.find();
    console.log(`👥 Fetched ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

app.get("/users/:id", async (req, res) => {
  try {
    if (!userModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("❌ Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
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
    res.json({ message: "User updated successfully", user: updated });
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

// ================= TASK MANAGEMENT (USER-SPECIFIC) =================

app.post("/tasks/add", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("✏️ Creating task:", req.body.title);
    const task = await taskModel.create(req.body);
    console.log("✅ Task created:", task._id);
    res.json({ message: "Task added successfully!", task });
  } catch (error) {
    console.error("❌ Error adding task:", error);
    res.status(500).json({ message: "Error adding task", error: error.message });
  }
});

// 🔥 USER-SPECIFIC: Fetch tasks based on user role
app.get("/tasks", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const { userId, role } = req.query;
    
    let tasks;
    
    // If Admin or no userId provided, return all tasks
    if (!userId || role === "Admin") {
      tasks = await taskModel.find()
        .populate('projectId', 'name')
        .populate('sprintId', 'sprintName');
      console.log(`📋 Admin: Fetched ${tasks.length} tasks`);
    } else {
      // For regular users, only return tasks they are assigned to
      tasks = await taskModel.find({
        'assignedTo.userId': userId
      })
        .populate('projectId', 'name')
        .populate('sprintId', 'sprintName');
      console.log(`📋 User ${userId}: Fetched ${tasks.length} assigned tasks`);
    }
    
    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
});

app.get("/tasks/:id", async (req, res) => {
  try {
    if (!taskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
    
    const task = await taskModel.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('sprintId', 'sprintName')
      .populate('assignedTo.userId', 'name employeeCode role');
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    console.error("❌ Error fetching task:", error);
    res.status(500).json({ message: "Error fetching task", error: error.message });
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

// ================= SPRINT MANAGEMENT (USER-SPECIFIC) =================

app.post("/sprints/add", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    console.log("🏃 Creating sprint:", req.body.sprintName);
    const sprint = await sprintModel.create(req.body);
    console.log("✅ Sprint created:", sprint._id);
    res.json({ message: "Sprint added successfully!", sprint });
  } catch (error) {
    console.error("❌ Error adding sprint:", error);
    res.status(500).json({ message: "Error adding sprint", error: error.message });
  }
});

// 🔥 USER-SPECIFIC: Fetch sprints based on user role
app.get("/sprints", async (req, res) => {
  try {
    if (!sprintModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const { userId, role } = req.query;
    
    let sprints;
    
    // If Admin or no userId provided, return all sprints
    if (!userId || role === "Admin") {
      sprints = await sprintModel.find()
        .populate('projectId', 'name')
        .populate('assignedUsers.userId', 'name employeeCode role');
      console.log(`🏃 Admin: Fetched ${sprints.length} sprints`);
    } else {
      // For regular users, only return sprints they are assigned to
      sprints = await sprintModel.find({
        'assignedUsers.userId': userId
      })
        .populate('projectId', 'name')
        .populate('assignedUsers.userId', 'name employeeCode role');
      console.log(`🏃 User ${userId}: Fetched ${sprints.length} assigned sprints`);
    }
    
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
    
    const sprint = await sprintModel.findById(req.params.id)
      .populate('projectId', 'name')
      .populate('assignedUsers.userId', 'name employeeCode role');
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

// ================= DAILY TASK MANAGEMENT (USER-SPECIFIC) =================

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

// 🔥 USER-SPECIFIC: Fetch daily tasks based on user role
app.get("/daily-tasks", async (req, res) => {
  try {
    if (!dailyTaskModel) {
      return res.status(503).json({ message: "Server is initializing, please try again" });
    }
    
    const { userId, role } = req.query;
    
    let dailyTasks;
    
    // If Admin or no userId provided, return all daily tasks
    if (!userId || role === "Admin") {
      dailyTasks = await dailyTaskModel.find()
        .populate('taskId', 'title')
        .populate('assignedUsers.userId', 'name employeeCode role');
      console.log(`📅 Admin: Fetched ${dailyTasks.length} daily tasks`);
    } else {
      // For regular users, only return daily tasks they are assigned to
      dailyTasks = await dailyTaskModel.find({
        'assignedUsers.userId': userId
      })
        .populate('taskId', 'title')
        .populate('assignedUsers.userId', 'name employeeCode role');
      console.log(`📅 User ${userId}: Fetched ${dailyTasks.length} assigned daily tasks`);
    }
    
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
      .populate('assignedUsers.userId', 'name employeeCode role');
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
      "GET /tasks?userId=xxx&role=xxx",
      "GET /sprints?userId=xxx&role=xxx",
      "GET /daily-tasks?userId=xxx&role=xxx",
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