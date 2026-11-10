import { Navigate, Outlet } from "react-router-dom";
import type { Role } from "../../users/models/Role";
import { useSesion } from "../hooks/useSesion";
import { hasMinimumRole } from "../../users/utils/role.utils";

interface RoleGuardProps {
  minimumRole: Role;
}

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
