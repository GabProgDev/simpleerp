import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../../features/auth';
import { EmployeeRole } from '../../features/employees/types/Employee';

interface RequireRoleProps {
  roles: EmployeeRole[];
}

export const RequireRole: React.FC<RequireRoleProps> = ({ roles }) => {
  const session = authService.getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (!authService.hasPermission(session.role, roles)) {
    // Se não tem permissão, volta para home (que todos têm acesso)
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};