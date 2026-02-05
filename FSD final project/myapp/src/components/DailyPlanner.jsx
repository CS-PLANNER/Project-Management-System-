import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DailyPlanner = () => {
  const navigate = useNavigate();
  const [dailyTasks, setDailyTasks] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  
  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'Admin';
  
  const [formData, setFormData] = useState({
    taskName: '',
    date: new Date().toISOString().split('T')[0],
    taskId: '',
    assignedUsers: [],
    description: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchDailyTasks();
  }, []);

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

  const fetchDailyTasks = async () => {
    try {
      const url = new URL('http://localhost:3008/daily-tasks');
      if (currentUser) {
        url.searchParams.append('userId', currentUser.userId);
        url.searchParams.append('role', currentUser.role);
      }
      
      const response = await fetch(url);
      const data = await response.json();
      setDailyTasks(data);
    } catch (error) {
      console.error('Error fetching daily tasks:', error);
      showMessage('error', 'Error fetching daily tasks');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (e) => {
    const taskId = e.target.value;
    const selectedTask = tasks.find(task => task._id === taskId);
    
    setFormData(prev => ({ 
      ...prev, 
      taskId,
      taskName: selectedTask ? selectedTask.title : '',
      assignedUsers: []
    }));
  };

  const handleUserSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    const selectedUsers = users.filter(user => selectedOptions.includes(user._id));
    
    const assignedUsers = selectedUsers.map(user => ({
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
      const dailyTaskData = {
        ...formData,
        createdBy: currentUser.userId
      };

      const response = await fetch('http://localhost:3008/daily-tasks/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dailyTaskData)
      });

      const result = await response.json();
      
      if (response.ok) {
        showMessage('success', result.message || 'Daily task created successfully!');
        setFormData({
          taskName: '',
          date: new Date().toISOString().split('T')[0],
          taskId: '',
          assignedUsers: [],
          description: '',
          status: 'Pending'
        });
        fetchDailyTasks();
      } else {
        showMessage('error', result.message || 'Error creating daily task');
      }
    } catch (error) {
      console.error('Error creating daily task:', error);
      showMessage('error', 'Failed to create daily task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      taskName: '',
      date: new Date().toISOString().split('T')[0],
      taskId: '',
      assignedUsers: [],
      description: '',
      status: 'Pending'
    });
    showMessage('info', 'Form cleared');
  };

  const getTaskUsers = () => {
    if (!formData.taskId) return [];
    const selectedTask = tasks.find(task => task._id === formData.taskId);
    return selectedTask?.assignedTo || [];
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

  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return dailyTasks.filter(task => 
      new Date(task.date).toISOString().split('T')[0] === today
    );
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>{isAdmin ? 'Daily Planner' : 'My Daily Tasks'}</h1>
        {!isAdmin && (
          <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Viewing daily tasks assigned to you
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
            <label>Daily Task Name *</label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              required
              placeholder="Enter daily task name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select Task *</label>
            <select
              name="taskId"
              value={formData.taskId}
              onChange={handleTaskChange}
              required
            >
              <option value="">Select a task</option>
              {tasks.map(task => (
                <option key={task._id} value={task._id}>
                  {task.title} ({task.status})
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
              disabled={!formData.taskId}
              style={{ height: '150px' }}
            >
              {formData.taskId ? (
                getTaskUsers().length > 0 ? (
                  getTaskUsers().map(user => (
                    <option key={user.userId} value={user.userId}>
                      {user.name} ({user.role})
                    </option>
                  ))
                ) : (
                  <option disabled>No users assigned to this task</option>
                )
              ) : (
                <option disabled>Please select a task first</option>
              )}
            </select>
            <small>Hold Ctrl/Cmd to select multiple users. Selected: {formData.assignedUsers.length} users</small>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter daily task description"
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
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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
              {loading ? 'Creating...' : 'Create Daily Task'}
            </button>
          </div>
        </form>
      )}

      <div style={{ marginTop: isAdmin ? '3rem' : '1rem' }}>
        <h2 style={{ color: '#0e666a', marginBottom: '1.5rem' }}>
          {isAdmin ? "Today's Daily Tasks" : "Your Today's Tasks"}
        </h2>
        {getTodaysTasks().length === 0 ? (
          <div className="empty-state">
            <p>
              {isAdmin 
                ? 'No daily tasks for today. Create your first daily task above.' 
                : 'No daily tasks assigned to you for today.'}
            </p>
          </div>
        ) : (
          <div className="projects-grid">
            {getTodaysTasks().map(task => (
              <div key={task._id} className="project-card">
                <div className="card-header">
                  <h3>{task.taskName}</h3>
                  <span className={`status ${task.status.toLowerCase().replace(' ', '-')}`}>
                    {task.status}
                  </span>
                </div>
                <p className="description">{task.description}</p>
                <div className="project-meta">
                  <div className="meta-item">
                    <span>📅 Date:</span>
                    <span>{formatDate(task.date)}</span>
                  </div>
                  <div className="meta-item">
                    <span>👥 Assigned:</span>
                    <span>{task.assignedUsers?.length || 0} users</span>
                  </div>
                  <div className="meta-item">
                    <span>📋 Parent Task:</span>
                    <span>{tasks.find(t => t._id === task.taskId)?.title || 'N/A'}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span>Daily Task</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyPlanner;
