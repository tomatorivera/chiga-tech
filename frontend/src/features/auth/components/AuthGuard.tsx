import { Navigate, Outlet } from "react-router-dom";
import { useSesion } from "../hooks/useSesion";

const AuthGuard = () => {
  const usuario = useSesion((state) => state.usuario);

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default AuthGuard;
