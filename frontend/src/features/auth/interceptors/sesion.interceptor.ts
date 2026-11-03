import axios from "axios";
import { http } from "../../../shared/lib/http";
import { useSesion } from "../hooks/useSesion";

// Sin usuario en el store, AuthGuard lleva al login. El 401 del login son credenciales inválidas, no una sesión caída
export function registerSesionInterceptor(): void {
  http.interceptors.response.use(undefined, (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      error.config?.url !== "/auth/login"
    ) {
      useSesion.getState().logout();
    }
    return Promise.reject(error);
  });
}
