import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('user') && localStorage.getItem('accessToken');
  });

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      if (!user || !token) {
        setIsAuthenticated(false);
        navigate('/login', { replace: true });
      }
    };

    const handlePageShow = (event) => {
      // Re-verify auth when page is restored from BFCache (back button)
      if (event.persisted) {
        checkAuth();
      } else {
        // Even if not persisted, it's good to double check on show
        checkAuth();
      }
    };

    const handleStorageChange = (event) => {
      // Handle logout from another tab or programmatic clear
      if (event.key === 'user' || event.key === 'accessToken' || event.key === null) {
        checkAuth();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', handleStorageChange);

    // Initial check on mount just in case
    checkAuth();

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('accessToken');
  
  if (!storedUser || !storedToken || !isAuthenticated) {
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
        return <Navigate to="/career-portal/dashboard" replace />;
      case 'ServiceExecutive':
        return <Navigate to="/service-executive/dashboard" replace />;
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
