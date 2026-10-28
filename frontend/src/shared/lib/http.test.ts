import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getErrorMessage, MENSAJE_ERROR_INESPERADO, MENSAJE_SIN_CONEXION } from "./http";

function errorConRespuesta(status: number, data: unknown): AxiosError {
  const response = { status, data } as AxiosResponse;
  return new AxiosError("error", undefined, undefined, undefined, response);
}

describe("getErrorMessage", () => {
  it("devuelve el detail del ProblemDetails", () => {
    const error = errorConRespuesta(401, {
      status: 401,
      title: "Unauthorized",
      detail: "Usuario o contraseña incorrectos.",
    });

    expect(getErrorMessage(error)).toBe("Usuario o contraseña incorrectos.");
  });

  it("une los errores de validación por campo", () => {
    const error = errorConRespuesta(400, {
      status: 400,
      title: "One or more validation errors occurred.",
      errors: {
        Username: ["El usuario debe tener entre 4 y 50 caracteres."],
        Password: ["La contraseña es obligatoria."],
      },
    });

    expect(getErrorMessage(error)).toBe(
      "El usuario debe tener entre 4 y 50 caracteres. La contraseña es obligatoria.",
    );
  });

  it("avisa de un problema de conexión si no hay respuesta", () => {
    const error = new AxiosError("Network Error", AxiosError.ERR_NETWORK);

    expect(getErrorMessage(error)).toBe(MENSAJE_SIN_CONEXION);
  });

  it("avisa de un problema de conexión si el proxy no llega al backend", () => {
    expect(getErrorMessage(errorConRespuesta(502, ""))).toBe(MENSAJE_SIN_CONEXION);
  });

  it("usa el mensaje de respaldo si la respuesta no es ProblemDetails", () => {
    expect(getErrorMessage(errorConRespuesta(500, ""))).toBe(MENSAJE_ERROR_INESPERADO);
  });

  it("usa el mensaje de respaldo si el error no viene de axios", () => {
    expect(getErrorMessage(new Error("boom"))).toBe(MENSAJE_ERROR_INESPERADO);
  });
});
