import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Task = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    sprintId: '',
    assignedTo: [],
    startDate: '',
    endDate: '',
    priority: 'Medium',
    status: 'To Do'
  });

  useEffect(() => {
    fetchSprints();
    fetchUsers();
    fetchProjects();
    fetchTasks();
  }, []);

  const fetchSprints = async () => {
    try {
      const url = new URL('http://localhost:3008/sprints');
      if (currentUser) {
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('role', currentUser.role);
      }
      
      const response = await fetch(url);
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

  const fetchTasks = async () => {
    try {
      const url = new URL('http://localhost:3008/tasks');
      if (currentUser) {
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('role', currentUser.role);
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showMessage('error', 'Error fetching tasks');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSprintChange = (e) => {
    const sprintId = e.target.value;
    const selectedSprint = sprints.find(s => s._id === sprintId);
    
    setFormData(prev => ({ 
      ...prev, 
      sprintId,
      projectId: selectedSprint?.projectId || '',
      assignedTo: []
    }));
  };

  const handleUserSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    const selectedUsers = users.filter(user => selectedOptions.includes(user._id));
    
    const assignedTo = selectedUsers.map(user => ({
      userId: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role
    }));
    
    setFormData(prev => ({ ...prev, assignedTo }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        showMessage('error', 'End date cannot be before start date');
        setLoading(false);
        return;
      }

      const taskData = {
        ...formData,
        createdBy: currentUser.userId
      };

      const response = await fetch('http://localhost:3008/tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });

      const result = await response.json();
      
      if (response.ok) {
        showMessage('success', result.message || 'Task created successfully!');
        setFormData({
          title: '',
          description: '',
          projectId: '',
          sprintId: '',
          assignedTo: [],
          startDate: '',
          endDate: '',
          priority: 'Medium',
          status: 'To Do'
        });
        fetchTasks();
      } else {
        showMessage('error', result.message || 'Error creating task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      showMessage('error', 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      projectId: '',
      sprintId: '',
      assignedTo: [],
      startDate: '',
      endDate: '',
      priority: 'Medium',
      status: 'To Do'
    });
    showMessage('info', 'Form cleared');
  };

  const getSprintUsers = () => {
    if (!formData.sprintId) return [];
    const selectedSprint = sprints.find(sprint => sprint._id === formData.sprintId);
    return selectedSprint?.assignedUsers || [];
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
        <h1>{isAdmin ? 'Create Task' : 'My Tasks'}</h1>
        {!isAdmin && (
          <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Viewing tasks assigned to you
          </p>
        )}
      </div>
      
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {isAdmin && (
        <form className="project-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Task Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task name"
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
            <label>Select Sprint *</label>
            <select
              name="sprintId"
              value={formData.sprintId}
              onChange={handleSprintChange}
              required
            >
              <option value="">Select a sprint</option>
              {sprints.map(sprint => (
                <option key={sprint._id} value={sprint._id}>
                  {sprint.sprintName} ({sprint.status})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assign Users *</label>
            <select
              multiple
              value={formData.assignedTo.map(u => u.userId)}
              onChange={handleUserSelect}
              required
              disabled={!formData.sprintId}
              style={{ height: '150px' }}
            >
              {formData.sprintId ? (
                getSprintUsers().length > 0 ? (
                  getSprintUsers().map(user => (
                    <option key={user.userId} value={user.userId}>
                      {user.name} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled>No users assigned to this sprint</option>
                )
              ) : (
                <option disabled>Please select a sprint first</option>
              )}
            </select>
            <small>Hold Ctrl/Cmd to select multiple users. Selected: {formData.assignedTo.length} users</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>
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
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: isAdmin ? '3rem' : '1rem' }}>
        <h2 style={{ color: '#0e666a', marginBottom: '1.5rem' }}>
          {isAdmin ? 'All Tasks' : 'Your Assigned Tasks'}
        </h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>
              {isAdmin 
                ? 'No tasks created yet. Create your first task above.' 
                : 'No tasks assigned to you yet.'}
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {tasks.map(task => (
              <div key={task._id} className="project-card">
                <div className="card-header">
                  <h3>{task.title}</h3>
                  <span className={`status-badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </div>
                <p className="description">{task.description}</p>
                <div className="project-meta">
                  <div className="meta-item">
                    <span>📅 Start:</span>
                    <span>{formatDate(task.startDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span>📅 End:</span>
                    <span>{formatDate(task.endDate)}</span>
                  </div>
                  <div className="meta-item">
                    <span>👥 Assigned:</span>
                    <span>{task.assignedTo?.length || 0} users</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
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

export default Task;
