import { getErrorMessage } from "../../../shared/lib/http";
import type { ActionStatus } from "../../../shared/types/action.types";
import { useSesion } from "../hooks/useSesion";
import { authService } from "../services/auth.service";

export const logoutAction = async (_prev: ActionStatus): Promise<ActionStatus> => {
  try {
    await authService.logout();

    // Recién cuando el backend borró la cookie, olvido al usuario en el frontend
    useSesion.getState().logout();
    return { status: "ok" };
  } catch (error) {
    // Si el backend no respondió, la cookie sigue viva: no hago de cuenta que la sesión se cerró
    return { status: "error", message: getErrorMessage(error) };
  }
};
