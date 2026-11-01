import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login";
import { Homepage } from "./pages/Homepage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/inicio" replace /> },
  { path: "/login", element: <Login /> },
  { path: "/inicio", element: <Homepage /> },
]);
