import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSesion } from "../hooks/useSesion";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import { authService } from "../services/auth.service";
import { sesionLoader } from "./sesion.loader";

const usuario: UsuarioDTO = {
  id: 1,
  nombreUsuario: "vendedor",
  nombre: "Ana",
  apellido: "Pérez",
  roles: ["Vendedor"],
  permisos: ["ventas"],
};

describe("sesionLoader", () => {
  const me = vi.spyOn(authService, "me");

  afterEach(() => {
    me.mockReset();
    useSesion.getState().logout();
  });

  it("guarda el usuario en la sesión si el backend responde 200", async () => {
    me.mockResolvedValue(usuario);

    await sesionLoader();

    expect(useSesion.getState().usuario).toEqual(usuario);
  });

  it("deja la app sin sesión si el backend responde 401", async () => {
    const response = { status: 401, data: {} } as AxiosResponse;
    me.mockRejectedValue(new AxiosError("error", undefined, undefined, undefined, response));

    await expect(sesionLoader()).resolves.toBeNull();

    expect(useSesion.getState().usuario).toBeNull();
  });

  it("deja la app sin sesión si el backend no responde", async () => {
    me.mockRejectedValue(new AxiosError("Network Error"));

    await expect(sesionLoader()).resolves.toBeNull();

    expect(useSesion.getState().usuario).toBeNull();
  });
});
