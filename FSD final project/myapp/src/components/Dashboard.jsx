import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, FolderKanban, CheckSquare, LogOut, Menu, X, CalendarDays } from "lucide-react";
import { useState } from "react";

const Dashboard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.userType === "Admin" || user?.role === "Admin";

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // ADMIN LAYOUT - Sidebar Design (Original)
  if (isAdmin) {
    return (
      <div className="dashboard-container">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-header">
            <h2>Project Management</h2>
            {user && (
              <div className="user-info">
                <p className="user-name">{user.name}</p>
                <p className="user-role">{user.role || user.userType}</p>
              </div>
            )}
          </div>
          
          <div className="nav-items">
            <Link
              to="/projects"
              className={`nav-item ${isActive("/projects") ? "active" : ""}`}
            >
              <FolderKanban size={20} />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks"
              className={`nav-item ${isActive("/tasks") ? "active" : ""}`}
            >
              <CheckSquare size={20} />
              <span>Tasks</span>
            </Link>

            <Link
              to="/sprint"
              className={`nav-item ${isActive("/sprint") ? "active" : ""}`}
            >
              <CheckSquare size={20} />
              <span>Sprint</span>
            </Link>

            <Link
              to="/daily-planner"
              className={`nav-item ${isActive("/daily-planner") ? "active" : ""}`}
            >
              <CalendarDays size={20} />
              <span>Daily Planner</span>
            </Link>

            <Link
              to="/users"
              className={`nav-item ${isActive("/users") ? "active" : ""}`}
            >
              <Users size={20} />
              <span>Users</span>
            </Link>
          </div>

          <div className="sidebar-footer">
            <button className="nav-item logout" onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    );
  }

  // USER LAYOUT - Top Navbar Design (New)
  return (
    <div className="dashboard-layout">
      {/* Top Navigation Bar */}
      <nav className="top-navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-icon">
              <FolderKanban size={24} />
            </div>
            <h1 className="brand-title">ProjectHub</h1>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            <Link
              to="/projects"
              className={`nav-link ${isActive("/projects") ? "active" : ""}`}
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks"
              className={`nav-link ${isActive("/tasks") ? "active" : ""}`}
            >
              <CheckSquare size={18} />
              <span>Tasks</span>
            </Link>

            <Link
              to="/sprint"
              className={`nav-link ${isActive("/sprint") ? "active" : ""}`}
            >
              <CheckSquare size={18} />
              <span>Sprint</span>
            </Link>

            <Link
              to="/daily-planner"
              className={`nav-link ${isActive("/daily-planner") ? "active" : ""}`}
            >
              <CalendarDays size={18} />
              <span>Daily Planner</span>
            </Link>
          </div>

          {/* User Section */}
          <div className="navbar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role || user?.userType}</p>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <Link
              to="/projects"
              className={`mobile-nav-link ${isActive("/projects") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </Link>

            <Link
              to="/tasks"
              className={`mobile-nav-link ${isActive("/tasks") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <CheckSquare size={18} />
              <span>Tasks</span>
            </Link>

            <Link
              to="/sprint"
              className={`mobile-nav-link ${isActive("/sprint") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <CheckSquare size={18} />
              <span>Sprint</span>
            </Link>

            <Link
              to="/daily-planner"
              className={`mobile-nav-link ${isActive("/daily-planner") ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <CalendarDays size={18} />
              <span>Daily Planner</span>
            </Link>

            <button 
              className="mobile-logout-btn" 
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="main-container">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;