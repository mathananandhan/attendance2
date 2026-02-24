import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const userInfo = localStorage.getItem('userInfo'); // Simple check for now

    return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
