import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";

export function AuthGuard() {
  const usuario = useSesion((state) => state.usuario);
  const location = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default AuthGuard;
