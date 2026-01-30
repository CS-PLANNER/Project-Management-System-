// ================= IMPORTS =================
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Models
const projectModel = require("./model/project");
const userModel = require("./model/user");
const taskModel = require("./model/task");

// ================= INITIALIZE =================
const app = express();

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cors());

// ================= MONGODB CONNECTION =================
const MONGODB_URI = "mongodb+srv://PMS:PMS2026@pms.7ioxyan.mongodb.net/project?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB Connected to project database");
    console.log("📁 Collections available:");
    
    // List collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        collections.forEach(collection => {
          console.log(`   - ${collection.name}`);
        });
      });
    
    // Create admin user
    createDefaultAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.log("⚠️  Using in-memory mode for testing");
  });

// Create default admin user
async function createDefaultAdmin() {
  try {
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
    mongoStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
  });
});

app.get("/api/debug/db", async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ error: "MongoDB not connected" });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Get counts
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
    console.log("🔍 Login attempt:", req.body.email);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await userModel.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ 
        message: "User not found. Use: admin@example.com",
        suggestion: "Check if admin user exists in database"
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
        message: "Invalid password. Use: admin@123",
        hint: "Check if password in database matches 'admin@123'"
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

// Add Project
app.post("/projects/add", async (req, res) => {
  try {
    const project = await projectModel.create(req.body);
    res.send({ message: "Project added successfully!", project });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error adding project" });
  }
});

// View All Projects
app.get("/projects", async (req, res) => {
  try {
    const projects = await projectModel.find();
    res.send(projects);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching projects" });
  }
});

// View Single Project
app.get("/projects/:id", async (req, res) => {
  try {
    const project = await projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).send({ message: "Project not found" });
    }
    res.send(project);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching project" });
  }
});

// Update Project
app.put("/projects/update/:id", async (req, res) => {
  try {
    await projectModel.findByIdAndUpdate(req.params.id, req.body);
    res.send({ message: "Project updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating project" });
  }
});

// Delete Project
app.delete("/projects/delete/:id", async (req, res) => {
  try {
    await projectModel.findByIdAndDelete(req.params.id);
    res.send({ message: "Project deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error deleting project" });
  }
});

// ================= USER MANAGEMENT =================

// Get all users (for admin)
app.get("/users", async (req, res) => {
  try {
    const users = await userModel.find({}, { password: 0 }); // Exclude password
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching users" });
  }
});

// Add new user (admin only)
app.post("/users/add", async (req, res) => {
  try {
    const { name, employeeCode, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await userModel.findOne({ $or: [{ email }, { employeeCode }] });
    if (existingUser) {
      return res.status(400).send({ message: "User with this email or employee code already exists" });
    }
    
    const newUser = await userModel.create({
      name,
      employeeCode,
      email,
      password,
      role
    });
    
    res.send({ 
      message: "User created successfully", 
      user: { ...newUser._doc, password: undefined }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error adding user" });
  }
});

// Update user
app.put("/users/update/:id", async (req, res) => {
  try {
    await userModel.findByIdAndUpdate(req.params.id, req.body);
    res.send({ message: "User updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating user" });
  }
});

// Delete user
app.delete("/users/delete/:id", async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.id);
    res.send({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error deleting user" });
  }
});



// ================= TASK MANAGEMENT =================

// Add Task
app.post("/tasks/add", async (req, res) => {
  try {
    const task = await taskModel.create(req.body);
    res.send({ message: "Task added successfully", task });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error adding task" });
  }
});

// Get tasks by project
app.get("/tasks/project/:projectId", async (req, res) => {
  try {
    const tasks = await taskModel.find({ projectId: req.params.projectId });
    res.send(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching tasks" });
  }
});

// Update task
app.put("/tasks/update/:id", async (req, res) => {
  try {
    await taskModel.findByIdAndUpdate(req.params.id, req.body);
    res.send({ message: "Task updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error updating task" });
  }
});

// Delete task
app.delete("/tasks/delete/:id", async (req, res) => {
  try {
    await taskModel.findByIdAndDelete(req.params.id);
    res.send({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error deleting task" });
  }
});

// ================= SERVER =================
const PORT = 3008;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Login endpoint: http://localhost:${PORT}/login`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔍 Debug DB: http://localhost:${PORT}/api/debug/db`);
});