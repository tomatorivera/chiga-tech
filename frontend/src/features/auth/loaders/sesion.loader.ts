import { useSesion } from "../hooks/useSesion";
import { authService } from "../services/auth.service";

export const sesionLoader = async (): Promise<null> => {
  try {
    useSesion.getState().login(await authService.me());
  } catch {
    // El store arranca vacío: cualquier error, no solo un 401, deja la app sin sesión
  }
  return null;
};
