import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const storedUser = localStorage.getItem('user');
  
  if (!storedUser) {
    // Not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);

  if (!allowedRoles.includes(user.role)) {
    // Authenticated but not allowed in this route, redirect to their proper dashboard
    switch (user.role) {
      case 'SuperAdmin':
        return <Navigate to="/super-admin/dashboard" replace />;
      case 'HRAdmin':
        return <Navigate to="/hr/dashboard" replace />;
      case 'Manager':
        return <Navigate to="/manager/dashboard" replace />;
      case 'Employee':
        return <Navigate to="/employee/dashboard" replace />;
      case 'Candidate':
        return <Navigate to="/candidate/dashboard" replace />;
      default:
        // Unknown role, redirect to login
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        return <Navigate to="/login" replace />;
    }
  }

  // Authenticated and authorized
  return children;
};

export default ProtectedRoute;
