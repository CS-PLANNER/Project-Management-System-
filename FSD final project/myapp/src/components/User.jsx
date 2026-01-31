import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Users as UsersIcon, Mail, Badge, Shield, Search, Filter, X } from "lucide-react";
import axios from "axios";

const User = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("All");
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
      alert("✅ User created successfully!");
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
    if (window.confirm("⚠️ Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/users/delete/${userId}`);
        alert("✅ User deleted successfully!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Failed to delete user");
      }
    }
  };

  const getRoleColor = (role) => {
    const roleColors = {
      "Admin": { bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", color: "#92400e", icon: "👑" },
      "Project Manager": { bg: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 100%)", color: "#6b21a8", icon: "📊" },
      "Frontend Developer": { bg: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)", color: "#1e40af", icon: "💻" },
      "Backend Developer": { bg: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)", color: "#1e3a8a", icon: "⚙️" },
      "UI/UX Designer": { bg: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)", color: "#9f1239", icon: "🎨" },
      "QA": { bg: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", color: "#065f46", icon: "✅" }
    };
    return roleColors[role] || { bg: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)", color: "#374151", icon: "👤" };
  };

  const roles = ["All", "Admin", "Project Manager", "Frontend Developer", "Backend Developer", "UI/UX Designer", "QA"];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "All" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Get stats
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === "Admin").length,
    developers: users.filter(u => u.role.includes("Developer")).length,
    others: users.filter(u => !u.role.includes("Developer") && u.role !== "Admin").length
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.1)"
      }}>
        <div style={{ 
          width: "80px",
          height: "80px",
          border: "4px solid #f3f4f6",
          borderTop: "4px solid #4f46e5",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "24px"
        }}></div>
        <p style={{ color: "#64748b", fontSize: "18px", fontWeight: "500" }}>Loading team members...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const isAdmin = currentUser?.userType === "Admin" || currentUser?.role === "Admin";

  return (
    <div className="users-container" style={{ maxWidth: "1400px", margin: "0 auto" }}>
      {/* Animated Background Gradient */}
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "300px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        opacity: 0.05,
        zIndex: -1,
        borderRadius: "0 0 50% 50%"
      }}></div>

      {/* Hero Header */}
      <div style={{ 
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: "24px",
        padding: "40px",
        marginBottom: "32px",
        boxShadow: "0 20px 60px rgba(102, 126, 234, 0.3)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "200px",
          height: "200px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "50%",
          filter: "blur(40px)"
        }}></div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <h1 style={{ 
                fontSize: "36px", 
                fontWeight: "800", 
                color: "white",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(10px)"
                }}>
                  <UsersIcon size={32} color="white" />
                </div>
                Team Management
              </h1>
              <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", marginLeft: "76px" }}>
                {isAdmin ? "Manage your organization's team members and roles" : "View team members and their roles"}
              </p>
            </div>
            
            {isAdmin && (
              <button
                onClick={() => setShowForm(true)}
                style={{
                  backgroundColor: "white",
                  color: "#667eea",
                  padding: "14px 28px",
                  borderRadius: "12px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                  fontWeight: "700",
                  fontSize: "15px",
                  transition: "all 0.3s",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 15px 40px rgba(0,0,0,0.3)";
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "0 10px 30px rgba(0,0,0,0.2)";
                }}
              >
                <Plus size={20} />
                Add Team Member
              </button>
            )}
          </div>

          {/* Stats Cards */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
            gap: "16px", 
            marginTop: "32px" 
          }}>
            {[
              { label: "Total Members", value: stats.total, icon: "👥", color: "rgba(255,255,255,0.95)" },
              { label: "Admins", value: stats.admins, icon: "👑", color: "rgba(255,255,255,0.95)" },
              { label: "Developers", value: stats.developers, icon: "💻", color: "rgba(255,255,255,0.95)" },
              { label: "Other Roles", value: stats.others, icon: "⚡", color: "rgba(255,255,255,0.95)" }
            ].map((stat, idx) => (
              <div key={idx} style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "20px",
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{stat.icon}</div>
                <div style={{ fontSize: "32px", fontWeight: "800", color: stat.color, marginBottom: "4px" }}>{stat.value}</div>
                <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", fontWeight: "500" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        display: "flex",
        gap: "16px",
        flexWrap: "wrap",
        alignItems: "center"
      }}>
        <div style={{ flex: "1", minWidth: "250px", position: "relative" }}>
          <Search size={20} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by name, email, or employee code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 12px 12px 44px",
              borderRadius: "10px",
              border: "2px solid #e2e8f0",
              fontSize: "14px",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#667eea"}
            onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <Filter size={18} color="#64748b" />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "2px solid #e2e8f0",
              fontSize: "14px",
              fontWeight: "500",
              backgroundColor: "white",
              cursor: "pointer",
              minWidth: "180px"
            }}
          >
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {(searchTerm || filterRole !== "All") && (
          <button
            onClick={() => { setSearchTerm(""); setFilterRole("All"); }}
            style={{
              padding: "12px 16px",
              borderRadius: "10px",
              border: "2px solid #fee2e2",
              background: "#fef2f2",
              color: "#dc2626",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <X size={16} />
            Clear
          </button>
        )}
      </div>

      {/* Add User Form Modal */}
      {showForm && isAdmin && (
        <>
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease"
          }} onClick={() => setShowForm(false)}></div>
          
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "40px",
            borderRadius: "24px",
            boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
            zIndex: 1001,
            maxWidth: "600px",
            width: "90%",
            maxHeight: "90vh",
            overflowY: "auto",
            animation: "slideUp 0.3s ease"
          }}>
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideUp {
                from { transform: translate(-50%, -45%); opacity: 0; }
                to { transform: translate(-50%, -50%); opacity: 1; }
              }
            `}</style>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h2 style={{ 
                fontSize: "28px", 
                color: "#1e293b",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Plus size={24} color="white" />
                </div>
                Add New Team Member
              </h2>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#f1f5f9",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s"
                }}
                onMouseOver={(e) => e.target.style.background = "#e2e8f0"}
                onMouseOut={(e) => e.target.style.background = "#f1f5f9"}
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "10px", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    color: "#374151"
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "10px", 
                      border: "2px solid #e2e8f0",
                      fontSize: "15px",
                      transition: "all 0.2s"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "10px", 
                    fontSize: "14px", 
                    fontWeight: "600",
                    color: "#374151"
                  }}>
                    Employee Code *
                  </label>
                  <input
                    type="text"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({...formData, employeeCode: e.target.value})}
                    placeholder="EMP001"
                    style={{ 
                      width: "100%", 
                      padding: "14px 16px", 
                      borderRadius: "10px", 
                      border: "2px solid #e2e8f0",
                      fontSize: "15px",
                      transition: "all 0.2s"
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#667eea";
                      e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#e2e8f0";
                      e.target.style.boxShadow = "none";
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "10px", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="john.doe@company.com"
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: "10px", 
                    border: "2px solid #e2e8f0",
                    fontSize: "15px",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "10px", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: "10px", 
                    border: "2px solid #e2e8f0",
                    fontSize: "15px",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#667eea";
                    e.target.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  marginBottom: "10px", 
                  fontSize: "14px", 
                  fontWeight: "600",
                  color: "#374151"
                }}>
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  style={{ 
                    width: "100%", 
                    padding: "14px 16px", 
                    borderRadius: "10px", 
                    border: "2px solid #e2e8f0",
                    fontSize: "15px",
                    backgroundColor: "white",
                    cursor: "pointer",
                    fontWeight: "500"
                  }}
                >
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>QA</option>
                  <option>Project Manager</option>
                  <option>UI/UX Designer</option>
                  <option>Admin</option>
                </select>
              </div>

              <div style={{ 
                display: "flex", 
                gap: "12px", 
                marginTop: "12px"
              }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    borderRadius: "10px",
                    border: "2px solid #e2e8f0",
                    background: "white",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    color: "#64748b"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#f8fafc";
                    e.target.style.borderColor = "#cbd5e1";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "white";
                    e.target.style.borderColor = "#e2e8f0";
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    padding: "14px 24px",
                    borderRadius: "10px",
                    border: "none",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 25px rgba(102, 126, 234, 0.5)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
                  }}
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Users Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: "28px"
      }}>
        {filteredUsers.map((user) => {
          const roleColor = getRoleColor(user.role);
          
          return (
            <div 
              key={user._id} 
              style={{
                backgroundColor: "white",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                border: "2px solid #f1f5f9",
                transition: "all 0.3s",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow = "0 20px 50px rgba(0,0,0,0.15)";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
                e.currentTarget.style.borderColor = "#f1f5f9";
              }}
            >
              {/* Decorative gradient background */}
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "120px",
                background: roleColor.bg,
                opacity: 0.15,
                borderRadius: "20px 20px 0 0"
              }}></div>

              {/* Role Badge */}
              <div style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                padding: "8px 16px",
                borderRadius: "10px",
                background: roleColor.bg,
                color: roleColor.color,
                fontSize: "13px",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
              }}>
                <span>{roleColor.icon}</span>
                {user.role}
              </div>

              {/* User Avatar */}
              <div style={{
                position: "relative",
                marginBottom: "20px",
                marginTop: "10px"
              }}>
                <div style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "20px",
                  background: roleColor.bg,
                  color: roleColor.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "800",
                  border: "4px solid white",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)"
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <h3 style={{
                fontSize: "22px",
                fontWeight: "700",
                color: "#1e293b",
                marginBottom: "12px",
                lineHeight: "1.2"
              }}>
                {user.name}
              </h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                marginBottom: "20px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <Badge size={18} color="#667eea" />
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>{user.employeeCode}</span>
                </div>
                
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0"
                }}>
                  <Mail size={18} color="#667eea" />
                  <span style={{ 
                    fontSize: "14px", 
                    fontWeight: "500", 
                    color: "#64748b",
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap",
                    flex: 1
                  }}>
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div style={{
                  display: "flex",
                  gap: "10px",
                  paddingTop: "20px",
                  borderTop: "2px solid #f1f5f9"
                }}>
                  <button
                    onClick={() => handleDelete(user._id)}
                    style={{
                      flex: 1,
                      background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
                      border: "2px solid #fca5a5",
                      color: "#dc2626",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.3)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "none";
                    }}
                  >
                    <Trash2 size={16} />
                    Remove User
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div style={{ 
          textAlign: "center", 
          padding: "80px 40px",
          background: "white",
          borderRadius: "24px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🔍</div>
          <h3 style={{ fontSize: "24px", color: "#1e293b", marginBottom: "12px", fontWeight: "700" }}>No Results Found</h3>
          <p style={{ color: "#64748b", fontSize: "16px", marginBottom: "24px" }}>
            {searchTerm || filterRole !== "All" 
              ? "Try adjusting your search or filter criteria" 
              : isAdmin ? "Start by adding your first team member" : "No users found in the system"}
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "14px 28px",
                borderRadius: "12px",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Plus size={20} />
              Add First User
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default User;