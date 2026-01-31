import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Sprint = () => {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sprintName: '',
    description: '',
    startDate: '',
    endDate: '',
    assignedUsers: [],
    projectId: '',
    status: 'Planning'
  });

  useEffect(() => {
    fetchSprints();
    fetchUsers();
    fetchProjects();
  }, []);

  const fetchSprints = async () => {
    try {
      const response = await fetch('http://localhost:3008/sprints');
      const data = await response.json();
      setSprints(data);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      showMessage('error', 'Error fetching sprints');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3008/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Error fetching users');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:3008/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showMessage('error', 'Error fetching projects');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    const selectedUserObjects = users.filter(user => selectedOptions.includes(user._id));
    
    // Format assignedUsers as expected by backend
    const assignedUsers = selectedUserObjects.map(user => ({
      userId: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role
    }));
    
    setFormData(prev => ({ ...prev, assignedUsers }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const sprintData = {
        ...formData,
        createdBy: user.userId
      };

      const response = await fetch('http://localhost:3008/sprints/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sprintData)
      });

      const result = await response.json();
      
      if (response.ok) {
        showMessage('success', result.message || 'Sprint created successfully!');
        setFormData({
          sprintName: '',
          description: '',
          startDate: '',
          endDate: '',
          assignedUsers: [],
          projectId: '',
          status: 'Planning'
        });
        fetchSprints(); // Refresh sprint list
      } else {
        showMessage('error', result.message || 'Error creating sprint');
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
      showMessage('error', 'Failed to create sprint');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      sprintName: '',
      description: '',
      startDate: '',
      endDate: '',
      assignedUsers: [],
      projectId: '',
      status: 'Planning'
    });
    showMessage('info', 'Form cleared');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Create Sprint</h1>
      </div>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <form className="project-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Sprint Name *</label>
          <input
            type="text"
            name="sprintName"
            value={formData.sprintName}
            onChange={handleChange}
            required
            placeholder="Enter sprint name"
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
          <label>Select Project *</label>
          <select
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            required
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Assign Users *</label>
          <select
            multiple
            value={formData.assignedUsers.map(u => u.userId)}
            onChange={handleUserSelect}
            required
            style={{ height: '150px' }}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} - {user.role} ({user.employeeCode})
              </option>
            ))}
          </select>
          <small>Hold Ctrl/Cmd to select multiple users. Selected: {formData.assignedUsers.length} users</small>
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter sprint description"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={handleCancel}
            disabled={loading}
          >
            Clear
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Sprint'}
          </button>
        </div>
      </form>

      {/* Display Created Sprints */}
      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ color: '#0e666a', marginBottom: '1.5rem' }}>Created Sprints</h2>
        {sprints.length === 0 ? (
          <div className="empty-state">
            <p>No sprints created yet. Create your first sprint above.</p>
          </div>
        ) : (
          <div className="projects-grid">
            {sprints.map(sprint => (
              <div key={sprint._id} className="project-card">
                <div className="card-header">
                  <h3>{sprint.sprintName}</h3>
                  <span className={`status ${sprint.status.toLowerCase().replace(' ', '-')}`}>
                    {sprint.status}
                  </span>
                </div>
                <p className="description">{sprint.description}</p>
                <div className="project-meta">
                  <div className="meta-item">
                    <span>📅 Start:</span>
                    <span>{formatDate(sprint.startDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span>📅 End:</span>
                    <span>{formatDate(sprint.endDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span>👥 Team:</span>
                    <span>{sprint.assignedUsers?.length || 0} members</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="status">
                    Project: {projects.find(p => p._id === sprint.projectId)?.name || 'N/A'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sprint;