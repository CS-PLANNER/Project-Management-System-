import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3008";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("📤 Sending login request...", { email, password });
      
      const response = await axios.post(
        `${API_URL}/login`,
        {
          email: email.trim().toLowerCase(),
          password: password.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );
      
      console.log("📥 Login response:", response.data);
      
      if (response.data.message === "Logged in successfully") {
        // Save user info
        const userData = {
          ...response.data,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem("user", JSON.stringify(userData));
        
        alert(`✅ Welcome ${response.data.name}!`);
        
        // Navigate to projects page
        navigate("/projects");
      } else {
        alert(`❌ ${response.data.message}`);
      }
      
    } catch (error) {
  console.error("🔥 Login error:", error);
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || "Login failed";
    
    if (status === 401 || status === 404) {
      // ✅ REMOVED admin credentials from alert
      alert("❌ Invalid email or password");
    } else if (status === 500) {
      alert("❌ Server error. Check backend console.");
    } else {
      alert(`❌ Error: ${message}`);
    }
  } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
    alert("❌ Cannot connect to backend server.");
  } else if (error.request) {
    alert("❌ No response from server.");
  } else {
    alert("❌ Error: " + error.message);
  }
} finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Project Management System</h2>
        <p style={styles.subtitle}>Login to continue</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="admin@123"
              required
              autoComplete="current-password"
            />
          </div>
          
          <button 
            type="submit" 
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{marginRight: '8px'}}>⏳</span>
                Logging in...
              </>
            ) : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "450px",
  },
  title: {
    marginBottom: "10px",
    textAlign: "center",
    color: "#333",
    fontSize: "24px",
    fontWeight: "600",
  },
  subtitle: {
    marginBottom: "20px",
    textAlign: "center",
    color: "#666",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#555",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "16px",
    transition: "border 0.3s",
  },
  button: {
    backgroundColor: "#4f46e5",
    color: "white",
    padding: "14px",
    border: "none",
    borderRadius: "6px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "10px",
  },
  instructions: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#f3f4f6",
    borderRadius: "6px",
    fontSize: "13px",
    color: "#555",
    lineHeight: "1.5",
    textAlign: "center"
  }
};

export default Login;