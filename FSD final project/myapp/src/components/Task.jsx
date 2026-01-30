import React, { useEffect, useState } from "react";
import axios from "axios";

const Task = ({ project  }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const API_URL = "http://localhost:3008";

  useEffect(() => {
    if (project?._id || '696a98a42163031f36bb1904') fetchTasks();
  }, [project]);
  
  const fetchTasks = async () => {
    const res = await axios.get(
      `${API_URL}/tasks/project/${(project?._id ||  '696a98a42163031f36bb1904')}`
    );
    setTasks(res.data);
  };

  const addTask = async () => {
    await axios.post(`${API_URL}/tasks/add`, {
      title,
      projectId: "696a98a42163031f36bb1904",
      status: "To Do"
    });
    setTitle("");
    fetchTasks();
  };

  if (!project) return (
    <>
      <p>Select a project first</p>
       <h2>Tasks for {project?.projectName}</h2>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="btn-primary" onClick={addTask}>
        Add Task
      </button>

      {tasks.map(t => (
        <div key={t._id} className="details-card">
          {t.title} — <b>{t.status}</b>
        </div>
      ))}
    </>
  )

  return (
    <div className="container">
      <h2>Tasks for {project.projectName}</h2>

      <input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button className="btn-primary" onClick={addTask}>
        Add Task
      </button>

      {tasks.map(t => (
        <div key={t._id} className="details-card">
          {t.title} — <b>{t.status}</b>
        </div>
      ))}
    </div>
  );
};

export default Task;
