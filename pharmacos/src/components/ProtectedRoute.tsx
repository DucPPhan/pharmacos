// src/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            // Save the page the user was trying to access to redirect back after login
            navigate('/login', { state: { from: location } });
        }
    }, [token, navigate, location]);

    // If a token exists, render the child component (the protected page)
    return token ? <>{children}</> : null; // or render a loading component
};

export default ProtectedRoute;