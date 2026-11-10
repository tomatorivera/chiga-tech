import { getErrorMessage } from "../../../shared/lib/http";
import type { ActionStatus } from "../../../shared/types/action.types";
import { authService } from "../services/auth.service";

export const logoutAction = async (_prev: ActionStatus): Promise<ActionStatus> => {
  try {
    await authService.logout();

    // Recarga la página para que no se pueda volver atrás
    // También garantiza que al volver a logear, no reingrese a la pag en la que estaba el anterior user
    location.replace("/login");
    return { status: "ok" };
  } catch (error) {
    return { status: "error", message: getErrorMessage(error) };
  }
};
