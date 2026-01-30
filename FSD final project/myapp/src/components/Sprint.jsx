import React, { useEffect, useState } from "react";
import axios from "axios";

const Sprint = ({ project }) => {
  const [sprints, setSprints] = useState([]);
  const [name, setName] = useState("");

  const API_URL = "http://localhost:3004";

  useEffect(() => {
    if (project?._id) fetchSprints();
  }, [project]);

  const fetchSprints = async () => {
    const res = await axios.get(
      `${API_URL}/sprints/project/${project._id}`
    );
    setSprints(res.data);
  };

  const addSprint = async () => {
    await axios.post(`${API_URL}/sprints/add`, {
      name,
      projectId: project._id
    });
    setName("");
    fetchSprints();
  };

  if (!project) return <p>Select a project first</p>;

  return (
    <div className="container">
      <h2>Sprints for {project.projectName}</h2>

      <input
        placeholder="Sprint name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button className="btn-primary" onClick={addSprint}>
        Add Sprint
      </button>

      {sprints.map(s => (
        <div key={s._id} className="details-card">
          {s.name}
        </div>
      ))}
    </div>
  );
};

export default Sprint;
