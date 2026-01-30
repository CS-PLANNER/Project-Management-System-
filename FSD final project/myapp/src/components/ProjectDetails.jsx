import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Calendar, Users } from "lucide-react";
import axios from "axios";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = "http://localhost:3008"; // Fixed: Changed from 3004 to 3008

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error("Error fetching project:", error);
      alert("Failed to load project details");
      navigate("/projects");
    } finally {
      setLoading(false);
    }
  };

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