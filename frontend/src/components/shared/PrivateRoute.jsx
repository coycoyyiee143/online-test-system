import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, role }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="spinner-border text-primary" />
    </div>
  );

  if (!user || !userData) return <Navigate to="/teacher/login" />;

  if (role && userData.role !== role) {
    if (userData.role === 'admin') return <Navigate to="/admin/dashboard" />;
    if (userData.role === 'teacher') return <Navigate to="/teacher/dashboard" />;
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute;