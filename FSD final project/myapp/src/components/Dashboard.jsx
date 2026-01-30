import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, FolderKanban, CheckSquare, LogOut } from "lucide-react";

const Dashboard = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

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
            className={`nav-item ${isActive("/tasks") ? "active" : ""}`}
          >
            <CheckSquare size={20} />
            <span>Sprint</span>
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
};

export default Dashboard;