// DIAGNOSTIC TEST - Run this to identify backend issues
// Save as: backend/test-backend.js

const axios = require('axios');

const API_URL = "http://localhost:3008";

async function runTests() {
  console.log("🔍 Running Backend Diagnostics...\n");
  
  // Test 1: Health Check
  console.log("Test 1: Health Check");
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log("✅ Health check passed:", response.data);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    console.log("   Backend might not be running!");
    return;
  }
  
  // Test 2: Database Debug
  console.log("\nTest 2: Database Debug");
  try {
    const response = await axios.get(`${API_URL}/api/debug/db`);
    console.log("✅ Database connected:", response.data);
  } catch (error) {
    console.log("❌ Database debug failed:", error.message);
  }
  
  // Test 3: Get Projects
  console.log("\nTest 3: Get Projects");
  try {
    const response = await axios.get(`${API_URL}/projects`);
    console.log(`✅ Fetched ${response.data.length} projects`);
  } catch (error) {
    console.log("❌ Get projects failed:", error.response?.data || error.message);
  }
  
  // Test 4: Get Sprints
  console.log("\nTest 4: Get Sprints");
  try {
    const response = await axios.get(`${API_URL}/sprints`);
    console.log(`✅ Fetched ${response.data.length} sprints`);
  } catch (error) {
    console.log("❌ Get sprints failed:", error.response?.data || error.message);
  }
  
  // Test 5: Create Sprint (simulated)
  console.log("\nTest 5: Create Sprint");
  try {
    const sprintData = {
      sprintName: "Test Sprint",
      description: "Test Description",
      startDate: "2025-02-01",
      endDate: "2025-02-15",
      assignedUsers: [],
      status: "Planning"
    };
    const response = await axios.post(`${API_URL}/sprints/add`, sprintData);
    console.log("✅ Sprint created:", response.data);
  } catch (error) {
    console.log("❌ Create sprint failed:", error.response?.data || error.message);
    if (error.response) {
      console.log("   Status:", error.response.status);
      console.log("   Response:", error.response.data);
    }
  }
  
  console.log("\n🔍 Diagnostics Complete!");
}

// Run tests
runTests().catch(err => {
  console.error("Fatal error:", err);
});