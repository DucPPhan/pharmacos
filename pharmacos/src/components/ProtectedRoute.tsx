// src/components/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading } = useAuth();
  const token = localStorage.getItem("token");

  // User is authenticated if they have either Firebase auth or localStorage token
  const isAuthenticated = !!currentUser || !!token;

  useEffect(() => {
    // Don't redirect while Firebase is still loading
    if (loading) return;

    if (!isAuthenticated) {
      // Save the page the user was trying to access to redirect back after login
      navigate("/login", { state: { from: location } });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Show loading while Firebase is checking auth state
  if (loading) {
    return <div>Loading...</div>; // or your loading component
  }

  // If user is authenticated, render the child component (the protected page)
  return isAuthenticated ? <>{children}</> : null;
};

export default ProtectedRoute;
