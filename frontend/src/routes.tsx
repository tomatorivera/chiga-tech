import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login";
import { Homepage } from "./pages/Homepage";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import { LoadingScreen } from "./shared/components/LoadingScreen";
import { sesionLoader } from "./features/auth/loaders/sesion.loader";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    loader: sesionLoader,
    shouldRevalidate: () => false,
    HydrateFallback: LoadingScreen,
    children: [
      {
        path: "/",
        element: <Navigate to="/inicio" replace />,
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
    ],
  },
]);
