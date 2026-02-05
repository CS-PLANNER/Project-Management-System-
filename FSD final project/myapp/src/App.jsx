import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Login from "./components/login";
import Dashboard from "./components/Dashboard";
import ProjectList from "./components/ProjectList";
import ProjectDetails from "./components/ProjectDetails";
import ProjectForm from "./components/ProjectForm";
import User from "./components/User";
import Task from "./components/Task";
import Sprint from "./components/Sprint";
import DailyPlanner from "./components/DailyPlanner";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? children : <Navigate to="/login" />;
};

// Admin Only Route Component
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.userType === "Admin" || user?.role === "Admin";
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
    // Redirect non-admin users to projects page
    return <Navigate to="/projects" />;
  }
  
  return children;
};

// Layout Component
const Layout = ({ children }) => {
  return <Dashboard>{children}</Dashboard>;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route - Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/projects" />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectList />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/sprint" 
          element={
            <ProtectedRoute>
             <Layout>
              <Sprint/>
             </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/projects/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectDetails />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
  path="/daily-planner" 
  element={
    <ProtectedRoute>
      <Layout>
        <DailyPlanner />
      </Layout>
    </ProtectedRoute>
  } 
/>
        <Route 
          path="/projects/:id/edit" 
          element={
            <ProtectedRoute>
              <Layout>
                <ProjectForm />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <Layout>
                <Task />
              </Layout>
            </ProtectedRoute>
          } 
        />
        
        
        {/* Admin Only Route - Users */}
        <Route 
          path="/users" 
          element={
            <AdminRoute>
              <Layout>
                <User />
              </Layout>
            </AdminRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/projects" />} />
      </Routes>
    </Router>
  );
};

export default App;