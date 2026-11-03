import { AxiosError, type AxiosAdapter, type AxiosResponse } from "axios";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { http } from "../../../shared/lib/http";
import { useSesion } from "../hooks/useSesion";
import { registerSesionInterceptor } from "./sesion.interceptor";

const respondeCon =
  (status: number): AxiosAdapter =>
  async (config) => {
    const response = { status, data: {}, config } as AxiosResponse;
    throw new AxiosError("error", undefined, config, undefined, response);
  };

describe("registerSesionInterceptor", () => {
  beforeAll(() => {
    registerSesionInterceptor();
  });

  beforeEach(() => {
    useSesion.getState().login({
      id: 1,
      nombreUsuario: "vendedor",
      nombre: "Ana",
      apellido: "Pérez",
      roles: ["Vendedor"],
      permisos: ["ventas"],
    });
  });

  afterEach(() => {
    useSesion.getState().logout();
  });

  it("limpia la sesión ante un 401 y mantiene el error", async () => {
    await expect(http.get("/api/productos", { adapter: respondeCon(401) })).rejects.toThrow();

    expect(useSesion.getState().usuario).toBeNull();
  });

  it("no limpia la sesión ante el 401 de POST /auth/login", async () => {
    await expect(http.post("/auth/login", {}, { adapter: respondeCon(401) })).rejects.toThrow();

    expect(useSesion.getState().usuario).not.toBeNull();
  });

  it("no limpia la sesión ante un 403", async () => {
    await expect(http.get("/api/productos", { adapter: respondeCon(403) })).rejects.toThrow();

    expect(useSesion.getState().usuario).not.toBeNull();
  });
});
