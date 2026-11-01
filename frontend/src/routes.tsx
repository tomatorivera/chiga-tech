import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login";
import { Homepage } from "./pages/Homepage";
import AuthGuard from "./features/auth/components/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/inicio" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: "/inicio",
        element: <Homepage />,
      },
    ],
  },
]);
