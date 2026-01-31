import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Added useParams
import { Eye, Edit2, Trash2, Calendar, Plus, Users, RefreshCw, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import axios from "axios";

const ProjectDetails = () => { // Changed from ProjectList to ProjectDetails
  const { id } = useParams(); // Get project ID from URL
  const [project, setProject] = useState(null); // Changed from projects to project
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const API_URL = "http://localhost:3008";

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      console.log("🔄 Fetching project details...");
      setLoading(true);
      
      // Changed endpoint from /projects to /projects/:id
      const response = await axios.get(`${API_URL}/projects/${id}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`✅ Found project:`, response.data);
      setProject(response.data); // Changed from setProjects to setProject
    } catch (error) {
      console.error("❌ Error fetching project details:", error);
      
      if (error.response && error.response.status === 404) {
        console.log("⚠️  Project not found");
        alert("Project not found");
        navigate("/projects");
      } else {
        alert("Failed to load project details. Please check your connection.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProject();
  };

  // Remove the handleDelete function since it's not needed in details view
  
  if (loading) {
    return (
      <div className="loading">
        Loading project details...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="not-found">
        <p>Project not found</p>
        <button onClick={() => navigate("/projects")} className="btn-primary">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-details">
      <div className="details-header">
        <button 
          onClick={() => navigate("/projects")}
          className="back-btn"
        >
          <ArrowLeft size={16} />
          Back to Projects
        </button>
        
        <div className="header-actions">
          <button onClick={handleRefresh} className="btn-secondary" disabled={refreshing}>
            <RefreshCw size={16} className={refreshing ? "spinning" : ""} />
            Refresh
          </button>
          <button
            onClick={() => navigate(`/projects/${id}/edit`)}
            className="btn-primary"
          >
            <Edit2 size={16} />
            Edit Project
          </button>
        </div>
      </div>

      <div className="details-card">
        <h1>{project.name}</h1>
        <p className="description">{project.description}</p>
        
        <div className="details-grid">
          <div className="detail-item">
            <strong>Status:</strong>
            <span className={`status ${project.status.toLowerCase().replace(" ", "-")}`}>
              {project.status}
            </span>
          </div>
          
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <strong>Start Date:</strong>
              <p>{new Date(project.startDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <Calendar size={18} />
            <div>
              <strong>End Date:</strong>
              <p>{new Date(project.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="detail-item">
            <Users size={18} />
            <div>
              <strong>Team Members:</strong>
              <p>{project.teamMembers?.length || 0} members</p>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="team-section">
            <h3>Team Members</h3>
            <div className="team-grid">
              {project.teamMembers.map((member, index) => (
                <div key={index} className="team-member">
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span className="role">{member.role}</span>
                  </div>
                  <span className="emp-code">{member.employeeCode}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;