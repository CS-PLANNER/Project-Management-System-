import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import axios from "axios";

const User = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    employeeCode: "",
    email: "",
    password: "",
    role: "Frontend Developer"
  });

  const API_URL = "http://localhost:3008";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(user);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.employeeCode || !formData.email || !formData.password) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/users/add`, formData);
      alert("User created successfully!");
      setShowForm(false);
      setFormData({
        name: "",
        employeeCode: "",
        email: "",
        password: "",
        role: "Frontend Developer"
      });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${API_URL}/users/delete/${userId}`);
        alert("User deleted successfully!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p>Loading users...</p>
      </div>
    );
  }

  // Check if current user is admin
  const isAdmin = currentUser?.userType === "Admin" || currentUser?.role === "Admin";

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "600", color: "#1e293b" }}>Users</h1>
        
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              backgroundColor: "#10b981",
              color: "white",
              padding: "10px 16px",
              borderRadius: "6px",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            <Plus size={18} />
            Add User
          </button>
        )}
      </div>

      {/* Add User Form (Admin only) */}
      {showForm && isAdmin && (
        <div style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "24px",
          border: "1px solid #e2e8f0"
        }}>
          <h2 style={{ fontSize: "18px", marginBottom: "16px", color: "#1e293b" }}>Add New User</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Employee Code *
                </label>
                <input
                  type="text"
                  value={formData.employeeCode}
                  onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                  required
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500" }}>
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #d1d5db" }}
              >
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
                <option>QA</option>
                <option>Project Manager</option>
                <option>UI/UX Designer</option>
                <option>Admin</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  background: "white",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  backgroundColor: "#10b981",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        border: "1px solid #e2e8f0"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Name</th>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Employee Code</th>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Email</th>
              <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Role</th>
              {isAdmin && <th style={{ padding: "16px", textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "16px" }}>{user.name}</td>
                <td style={{ padding: "16px" }}>{user.employeeCode}</td>
                <td style={{ padding: "16px" }}>{user.email}</td>
                <td style={{ padding: "16px" }}>
                  <span style={{
                    padding: "4px 8px",
                    borderRadius: "4px",
                    backgroundColor: user.role === "Admin" ? "#fef3c7" : 
                                   user.role.includes("Developer") ? "#dbeafe" : "#dcfce7",
                    color: user.role === "Admin" ? "#92400e" : 
                          user.role.includes("Developer") ? "#1e40af" : "#065f46",
                    fontSize: "12px",
                    fontWeight: "500"
                  }}>
                    {user.role}
                  </span>
                </td>
                {isAdmin && (
                  <td style={{ padding: "16px" }}>
                    <button
                      onClick={() => handleDelete(user._id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <p>No users found.</p>
        </div>
      )}
    </div>
  );
};

export default User;