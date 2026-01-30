import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axios from "axios";

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "Not Started",
    teamMembers: []
  });

  const API_URL = "http://localhost:3008"; // Fixed: Changed from 3004 to 3008

  // Fetch project data if editing
  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      const project = response.data;
      
      // Format dates for input fields
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };

      setFormData({
        name: project.name || "",
        description: project.description || "",
        startDate: project.startDate ? formatDate(project.startDate) : "",
        endDate: project.endDate ? formatDate(project.endDate) : "",
        status: project.status || "Not Started",
        teamMembers: project.teamMembers || []
      });
    } catch (error) {
      console.error("Error fetching project:", error);
      alert("Failed to load project data");
      navigate("/projects");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate dates
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        alert("End date cannot be before start date");
        setLoading(false);
        return;
      }

      if (id) {
        // Update existing project
        await axios.put(`${API_URL}/projects/update/${id}`, formData);
        alert("Project updated successfully!");
      } else {
        // Create new project
        await axios.post(`${API_URL}/projects/add`, formData);
        alert("Project created successfully!");
      }
      
      navigate("/projects");
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button 
          onClick={() => navigate("/projects")}
          className="back-btn"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1>{id ? "Edit Project" : "Create New Project"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label>Project Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter project name"
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter project description"
            rows="4"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>End Date *</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : (id ? "Update Project" : "Create Project")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;