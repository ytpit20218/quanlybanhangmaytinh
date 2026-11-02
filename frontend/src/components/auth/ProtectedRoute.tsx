// ==========================================
// PROTECTED ROUTE GUARD
// ==========================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Verifying Security Credentials...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving target location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
