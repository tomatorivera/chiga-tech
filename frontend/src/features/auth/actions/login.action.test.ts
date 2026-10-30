import { AxiosError, type AxiosResponse } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MENSAJE_SIN_CONEXION } from "../../../shared/lib/http";
import { useSesion } from "../hooks/useSesion";
import type { UsuarioDTO } from "../models/UsuarioDTO";
import { authService } from "../services/auth.service";
import { loginAction } from "./login.action";

const usuario: UsuarioDTO = {
  id: 1,
  nombreUsuario: "vendedor",
  nombre: "Ana",
  apellido: "Pérez",
  roles: ["Vendedor"],
  permisos: ["ventas"],
};

function enviar(username: string, password: string) {
  const formData = new FormData();
  formData.set("username", username);
  formData.set("password", password);
  return loginAction({ status: "idle" }, formData);
}

function errorConRespuesta(status: number, data: unknown): AxiosError {
  const response = { status, data } as AxiosResponse;
  return new AxiosError("error", undefined, undefined, undefined, response);
}

describe("loginAction", () => {
  const login = vi.spyOn(authService, "login");

  beforeEach(() => {
    login.mockReset();
    login.mockResolvedValue(usuario);
  });

  afterEach(() => {
    useSesion.getState().logout();
  });

  it("guarda el usuario en la sesión si las credenciales son correctas", async () => {
    const resultado = await enviar("vendedor", "chiga1234");

    expect(resultado).toEqual({ status: "ok" });
    expect(useSesion.getState().usuario).toEqual(usuario);
  });

  it("recorta el usuario pero no la contraseña", async () => {
    await enviar("  vendedor  ", "  chiga1234  ");

    expect(login).toHaveBeenCalledWith({ username: "vendedor", password: "  chiga1234  " });
  });

  it.each([
    ["vacío", "", "El nombre de usuario es requerido"],
    ["corto", "abc", "El nombre de usuario debe tener entre 4 y 50 caracteres"],
    ["corto entre espacios", "  abc  ", "El nombre de usuario debe tener entre 4 y 50 caracteres"],
    ["largo", "a".repeat(51), "El nombre de usuario debe tener entre 4 y 50 caracteres"],
  ])("rechaza sin llamar al backend un usuario %s", async (_caso, username, mensaje) => {
    const resultado = await enviar(username, "chiga1234");

    expect(resultado).toEqual({
      status: "error",
      fieldErrors: { username: mensaje },
      previousValues: { username },
    });
    expect(login).not.toHaveBeenCalled();
  });

  it("rechaza sin llamar al backend un usuario de solo espacios", async () => {
    const resultado = await enviar("     ", "chiga1234");

    expect(resultado).toMatchObject({
      status: "error",
      fieldErrors: { username: expect.any(String) },
    });
    expect(login).not.toHaveBeenCalled();
  });

  it.each([
    ["4 caracteres", "abcd", "abcd"],
    ["50 caracteres", "a".repeat(50), "a".repeat(50)],
    ["4 caracteres entre espacios", "  abcd  ", "abcd"],
    ["50 caracteres entre espacios", ` ${"a".repeat(50)} `, "a".repeat(50)],
  ])("acepta un usuario de %s", async (_caso, username, enviado) => {
    await enviar(username, "chiga1234");

    expect(login).toHaveBeenCalledWith({ username: enviado, password: "chiga1234" });
  });

  it("rechaza sin llamar al backend una contraseña vacía", async () => {
    const resultado = await enviar("vendedor", "");

    expect(resultado).toEqual({
      status: "error",
      fieldErrors: { password: "La contraseña es requerida" },
      previousValues: { username: "vendedor" },
    });
    expect(login).not.toHaveBeenCalled();
  });

  it("devuelve por campo los errores de validación del backend", async () => {
    login.mockRejectedValue(
      errorConRespuesta(400, { errors: { username: ["Error del backend"] } }),
    );

    const resultado = await enviar("vendedor", "chiga1234");

    expect(resultado).toEqual({
      status: "error",
      fieldErrors: { username: "Error del backend" },
      previousValues: { username: "vendedor" },
    });
    expect(useSesion.getState().usuario).toBeNull();
  });

  it("prioriza los errores por campo si la respuesta también trae detail", async () => {
    login.mockRejectedValue(
      errorConRespuesta(400, { detail: "Detalle", errors: { username: ["Error del backend"] } }),
    );

    const resultado = await enviar("vendedor", "chiga1234");

    expect(resultado).toEqual({
      status: "error",
      fieldErrors: { username: "Error del backend" },
      previousValues: { username: "vendedor" },
    });
  });

  it("devuelve el detail del backend como mensaje general", async () => {
    login.mockRejectedValue(errorConRespuesta(401, { detail: "Las credenciales son inválidas." }));

    const resultado = await enviar("vendedor", "incorrecta");

    expect(resultado).toEqual({
      status: "error",
      message: "Las credenciales son inválidas.",
      previousValues: { username: "vendedor" },
    });
    expect(useSesion.getState().usuario).toBeNull();
  });

  it("avisa si no se pudo conectar con el servidor", async () => {
    login.mockRejectedValue(new AxiosError("Network Error", AxiosError.ERR_NETWORK));

    const resultado = await enviar("vendedor", "chiga1234");

    expect(resultado).toEqual({
      status: "error",
      message: MENSAJE_SIN_CONEXION,
      previousValues: { username: "vendedor" },
    });
  });
});
