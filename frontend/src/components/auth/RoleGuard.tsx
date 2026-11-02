// ==========================================
// ROLE AUTHORIZATION GUARD
// ==========================================

import React from 'react';
import { Forbidden403 } from '../../pages/Forbidden403';
import { useAuth } from '../../state/AuthContext';
import { UserRole } from '../../types';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Forbidden403 requiredRoles={allowedRoles} />;
  }

  return <>{children}</>;
};
