import { createBrowserRouter, Navigate } from "react-router-dom";
import { Login } from "./features/auth/Login";
import { Homepage } from "./pages/Homepage";
import { AuthGuard } from "./features/auth/components/AuthGuard";
import { LoadingScreen } from "./shared/components/LoadingScreen";
import { sesionLoader } from "./features/auth/loaders/sesion.loader";
import { MainLayout } from "./shared/layouts/MainLayout";
import { Forbidden } from "./pages/Forbidden";
import { RoleGuard } from "./features/auth/components/RoleGuard";
import { ProductsPage } from "./features/products/ProductsPage";
import { UsersPage } from "./features/users/UsersPage";
import { AdminsPage } from "./features/admins/AdminsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    element: <AuthGuard />,
    loader: sesionLoader,
    shouldRevalidate: () => false,
    HydrateFallback: LoadingScreen,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: "/",
            element: <Navigate to="/inicio" replace />,
          },
          {
            path: "/inicio",
            element: <Homepage />,
          },
          {
            path: "/forbidden",
            element: <Forbidden />,
          },
          {
            element: <RoleGuard minimumRole="Supervisor" />,
            children: [
              {
                path: "/productos",
                element: <ProductsPage />,
              },
            ],
          },
          {
            element: <RoleGuard minimumRole="Administrador" />,
            children: [
              {
                path: "/usuarios",
                element: <UsersPage />,
              },
            ],
          },
          {
            element: <RoleGuard minimumRole="Dueño" />,
            children: [
              {
                path: "/administradores",
                element: <AdminsPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
