import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Edit2, Trash2, Calendar, Plus, Users } from "lucide-react";
import axios from "axios";

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3008";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axios.delete(`${API_URL}/projects/delete/${projectId}`);
        alert("Project deleted successfully!");
        fetchProjects();
      } catch (error) {
        console.error("Error deleting project:", error);
        alert("Failed to delete project");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Started":
        return { bg: "#f3f4f6", color: "#374151" };
      case "In Progress":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "On Hold":
        return { bg: "#fef3c7", color: "#92400e" };
      case "Completed":
        return { bg: "#d1fae5", color: "#065f46" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div className="page-header">
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Manage and track all your projects in one place
          </p>
        </div>
        <button
          onClick={() => navigate("/projects/new")}
          className="btn-primary"
        >
          <Plus size={20} />
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
          <p>No projects found. Create your first project to get started!</p>
          <button
            onClick={() => navigate("/projects/new")}
            className="btn-primary"
            style={{ marginTop: "1rem" }}
          >
            <Plus size={20} />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => {
            const statusColors = getStatusColor(project.status);

            return (
              <div key={project._id} className="project-card">
                <div className="card-header">
                  <h3>{project.name}</h3>
                  <div className="card-actions">
                    <button
                      onClick={() => navigate(`/projects/${project._id}`)}
                      className="icon-btn"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/projects/${project._id}/edit`)
                      }
                      className="icon-btn"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(project._id)}
                      className="icon-btn delete"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <p className="description">
                  {project.description?.substring(0, 120)}
                  {project.description?.length > 120 ? "..." : ""}
                </p>

                <div className="project-meta">
                  <span className="meta-item">
                    <Calendar size={16} />
                    {new Date(project.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="meta-item">
                    <Users size={16} />
                    {project.teamMembers?.length || 0} members
                  </span>
                </div>

                <div className="card-footer">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: statusColors.bg,
                      color: statusColors.color,
                    }}
                  >
                    {project.status}
                  </span>

                  <button
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectList;