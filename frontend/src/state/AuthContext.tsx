// ==========================================
// REACT AUTHENTICATION CONTEXT
// ==========================================

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthResponse, getDefaultRouteForRole } from '../services/authService';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  logout: () => void;
  getDefaultRoute: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on initial load or refresh
  useEffect(() => {
    const existing = AuthService.getCurrentSession();
    if (existing) {
      setUser(existing);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    // Simulate brief network latency for realistic interaction
    await new Promise((r) => setTimeout(r, 200));

    const result = AuthService.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    setIsLoading(false);
    return result;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const getDefaultRoute = (): string => {
    if (!user) return '/login';
    return getDefaultRouteForRole(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
