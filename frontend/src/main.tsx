import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { registerSesionInterceptor } from "./features/auth/interceptors/sesion.interceptor";
import { router } from "./routes";

import "./index.css";

registerSesionInterceptor();

// "Atrás" puede restaurar una página desde bfcache con el usuario en memoria, sin volver a validar la sesión
window.addEventListener("pageshow", (event) => {
  if (event.persisted) window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
