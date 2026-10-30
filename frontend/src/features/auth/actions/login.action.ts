import { getErrorMessage, getFieldErrors } from "../../../shared/lib/http";
import type { ActionStatus } from "../../../shared/types/action.types";
import { useSesion } from "../hooks/useSesion";
import type { LoginRequestDTO } from "../models/LoginRequestDTO";
import { authService } from "../services/auth.service";

type LoginFields = keyof LoginRequestDTO;
type LoginStatus = ActionStatus<LoginFields>;

export const loginAction = async (_prev: LoginStatus, formData: FormData): Promise<LoginStatus> => {
  const username = (formData.get("username") as string | null) ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const previousValues = { username: username };

  const errors: Partial<Record<LoginFields, string>> = {};

  if (!username) errors.username = "El nombre de usuario es requerido";
  else if (username.trim().length < 4 || username.trim().length > 50)
    errors.username = "El nombre de usuario debe tener entre 4 y 50 caracteres";
  if (!password) errors.password = "La contraseña es requerida";

  if (Object.keys(errors).length > 0)
    return { status: "error", fieldErrors: errors, previousValues };

  try {
    const user = await authService.login({ username, password });

    // Si el inicio de sesión es correcto, guardo sus datos en el estado global de la app
    useSesion.getState().login(user);
    return { status: "ok" };
  } catch (error) {
    const fieldErrors = getFieldErrors<LoginFields>(error);
    if (fieldErrors) return { status: "error", fieldErrors };

    return { status: "error", message: getErrorMessage(error), previousValues };
  }
};
