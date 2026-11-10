import { Navigate, Outlet } from "react-router-dom";
import { ROLES, type Role } from "../../users/models/Role";
import { useSesion } from "../hooks/useSesion";

interface RoleGuardProps {
  minimumRole: Role;
}

const hasMinimumRole = (userRoles: string[], minimumRole: Role): boolean => {
  const minimumWeight = ROLES.indexOf(minimumRole);
  return userRoles.some((role) => ROLES.indexOf(role as Role) >= minimumWeight);
};

export const RoleGuard = ({ minimumRole }: RoleGuardProps) => {
  const user = useSesion((state) => state.usuario);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinimumRole(user.roles, minimumRole)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
};
