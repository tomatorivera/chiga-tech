import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MENSAJE_SIN_CONEXION } from "../../../shared/lib/http";
import { useSesion } from "../hooks/useSesion";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import { authService } from "../services/auth.service";
import { logoutAction } from "./logout.action";

const usuario: UsuarioDTO = {
  id: 1,
  nombreUsuario: "vendedor",
  nombre: "Ana",
  apellido: "Pérez",
  roles: ["Vendedor"],
  permisos: [],
};

describe("logoutAction", () => {
  const logout = vi.spyOn(authService, "logout");

  beforeEach(() => {
    logout.mockReset();
    logout.mockResolvedValue();
    useSesion.getState().login(usuario);
  });

  afterEach(() => {
    useSesion.getState().logout();
  });

  it("cierra la sesión en el backend y olvida al usuario", async () => {
    const resultado = await logoutAction({ status: "idle" });

    expect(resultado).toEqual({ status: "ok" });
    expect(logout).toHaveBeenCalledOnce();
    expect(useSesion.getState().usuario).toBeNull();
  });

  it("mantiene al usuario y avisa si el servidor no responde", async () => {
    logout.mockRejectedValue(new AxiosError("Network Error"));

    const resultado = await logoutAction({ status: "idle" });

    expect(resultado).toEqual({ status: "error", message: MENSAJE_SIN_CONEXION });
    expect(useSesion.getState().usuario).toEqual(usuario);
  });
});
