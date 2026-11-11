import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../../users/models/Role";
import { useSesion } from "../hooks/useSesion";
import { hasMinimumRole } from "../../users/utils/role.utils";
import type { ForbiddenState } from "../../../pages/Forbidden";

interface RoleGuardProps {
  minimumRole: Role;
}

export const RoleGuard = ({ minimumRole }: RoleGuardProps) => {
  const user = useSesion((state) => state.usuario);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasMinimumRole(user.roles, minimumRole)) {
    const state: ForbiddenState = {
      from: location.pathname,
      canGoBack: location.key !== "default",
    };
    return <Navigate to="/forbidden" replace state={state} />;
  }

  return <Outlet />;
};
