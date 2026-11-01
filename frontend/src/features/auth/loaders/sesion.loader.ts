import { useSesion } from "../hooks/useSesion";
import { authService } from "../services/auth.service";

// La cookie es HttpOnly: solo el backend puede decir si hay sesión al cargar la app (ADR técnico 0003)
export const sesionLoader = async (): Promise<null> => {
  try {
    useSesion.getState().login(await authService.me());
  } catch {
    // El store arranca vacío: cualquier error, no solo un 401, deja la app sin sesión
  }
  return null;
};
