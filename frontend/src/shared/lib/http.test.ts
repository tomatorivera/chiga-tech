import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import {
  getErrorMessage,
  getFieldErrors,
  MENSAJE_ERROR_INESPERADO,
  MENSAJE_SIN_CONEXION,
} from "./http";

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

  it("ignora los errores de validación por campo, los hace getFieldErrors", () => {
    const error = errorConRespuesta(400, {
      status: 400,
      title: "One or more validation errors occurred.",
      errors: {
        Username: ["El usuario debe tener entre 4 y 50 caracteres."],
        Password: ["La contraseña es obligatoria."],
      },
    });

    expect(getErrorMessage(error)).toBe("Ocurrió un error inesperado. Intentá de nuevo.");
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

  it.each([502, 503, 504])("prioriza el problema de conexión ante un %i con detail", (status) => {
    const error = errorConRespuesta(status, { status, detail: "Mensaje del proxy." });

    expect(getErrorMessage(error)).toBe(MENSAJE_SIN_CONEXION);
  });

  it.each([
    ["vacío", ""],
    ["null", null],
  ])("usa el mensaje de respaldo si el detail es %s", (_caso, detail) => {
    const error = errorConRespuesta(400, { status: 400, detail });

    expect(getErrorMessage(error)).toBe(MENSAJE_ERROR_INESPERADO);
  });
});

describe("getFieldErrors", () => {
  function errorDeValidacion(errors: Record<string, string[]>): AxiosError {
    return errorConRespuesta(400, {
      status: 400,
      title: "One or more validation errors occurred.",
      errors,
    });
  }

  it("devuelve los mismos campos que el error", () => {
    const error = errorDeValidacion({
      username: ["El nombre de usuario es requerido"],
      password: ["La contraseña es requerida"],
      otroCampo: ["Campo extra de prueba"],
    });

    expect(Object.keys(getFieldErrors(error)!)).toEqual(["username", "password", "otroCampo"]);
  });

  it("asigna a cada campo su mensaje de error", () => {
    const error = errorDeValidacion({
      username: ["El nombre de usuario es requerido"],
      password: ["La contraseña es requerida"],
    });

    expect(getFieldErrors(error)).toEqual({
      username: "El nombre de usuario es requerido",
      password: "La contraseña es requerida",
    });
  });

  it.each<{
    cantidad: number;
    errors: Record<string, string[]>;
    esperado: Record<string, string>;
  }>([
    {
      cantidad: 1,
      errors: { username: ["Primero de username", "Segundo de username"] },
      esperado: { username: "Primero de username" },
    },
    {
      cantidad: 2,
      errors: {
        username: ["Primero de username", "Segundo de username"],
        password: ["Primero de password", "Segundo de password"],
      },
      esperado: { username: "Primero de username", password: "Primero de password" },
    },
    {
      cantidad: 3,
      errors: {
        username: ["Primero de username", "Segundo de username"],
        password: ["Primero de password", "Segundo de password"],
        nombre: ["Primero de nombre", "Segundo de nombre"],
      },
      esperado: {
        username: "Primero de username",
        password: "Primero de password",
        nombre: "Primero de nombre",
      },
    },
  ])("ignora el segundo mensaje con $cantidad campo(s)", ({ errors, esperado }) => {
    expect(getFieldErrors(errorDeValidacion(errors))).toEqual(esperado);
  });

  it("conserva las claves que no son campos de un formulario", () => {
    const error = errorDeValidacion({ "$.username": ["El valor no es válido"] });

    expect(getFieldErrors(error)).toEqual({ "$.username": "El valor no es válido" });
  });

  it.each([
    ["la respuesta no trae errors", errorConRespuesta(401, { status: 401, detail: "Sin acceso." })],
    ["errors está vacío", errorDeValidacion({})],
    ["ningún campo tiene mensajes", errorDeValidacion({ username: [] })],
    ["la respuesta no es ProblemDetails", errorConRespuesta(500, "")],
    ["no hay respuesta", new AxiosError("Network Error", AxiosError.ERR_NETWORK)],
    ["el error no viene de axios", new Error("boom")],
  ])("devuelve undefined si %s", (_caso, error) => {
    expect(getFieldErrors(error)).toBeUndefined();
  });
});
