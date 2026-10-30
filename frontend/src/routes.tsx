import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login";
import { Inicio } from "./features/inicio/Inicio";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/inicio" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/inicio", element: <Inicio /> },
]);
