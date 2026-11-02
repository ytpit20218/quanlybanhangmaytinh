// ==========================================
// AUTHENTICATION & ROLE AUTHORIZATION SERVICE
// ==========================================

import { User, UserRole } from '../types';
import { mockDb } from './mockDatabase';

const SESSION_KEY = 'computertech_auth_session_v1';

export const ROLE_LANDING_PAGES: Record<UserRole, string> = {
  customer: '/store',
  admin: '/admin/dashboard',
  sale: '/sales/pos',
  warehouse: '/warehouse/inventory',
  technician: '/technician/tickets',
};

export const getDefaultRouteForRole = (role: UserRole): string => {
  return ROLE_LANDING_PAGES[role] || '/store';
};

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
  destinationRoute?: string;
}

export class AuthService {
  /**
   * Validate credentials and active status
   */
  static login(email: string, password?: string): AuthResponse {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email address is required.' };
    }

    const user = mockDb.getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Account not found. Please verify your email.' };
    }

    // Check account active state (Requirement: inactive account denial)
    if (!user.active) {
      return {
        success: false,
        error: 'Access Denied: Your account has been suspended or deactivated. Contact your system administrator.',
      };
    }

    // Password validation (simulated)
    if (user.password && password && user.password !== password) {
      return { success: false, error: 'Invalid password. Please check your credentials.' };
    }

    // Save session
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to persist session:', e);
    }

    return {
      success: true,
      user,
      destinationRoute: getDefaultRouteForRole(user.role),
    };
  }

  /**
   * Terminate session and remove credentials
   */
  static logout(): void {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  }

  /**
   * Retrieve active session
   */
  static getCurrentSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed: User = JSON.parse(raw);
        // Verify user still exists in database and is active
        const fresh = mockDb.getUserById(parsed.id);
        if (fresh && fresh.active) {
          return fresh;
        }
      }
    } catch (e) {
      console.warn('Invalid session payload in localStorage:', e);
    }
    return null;
  }

  /**
   * Check if user's role is authorized for given allowed roles
   */
  static isAuthorized(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }
}
