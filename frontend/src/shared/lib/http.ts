import axios from "axios";
import type { ProblemDetails } from "../types/api.types";

export const http = axios.create();

export const MENSAJE_SIN_CONEXION =
  "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
export const MENSAJE_ERROR_INESPERADO = "Ocurrió un error inesperado. Intentá de nuevo.";

// Convierte cualquier error de una request en un mensaje para el usuario. El backend redacta los mensajes
export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ProblemDetails>(error)) return MENSAJE_ERROR_INESPERADO;

  const { response } = error;

  if (!response || [502, 503, 504].includes(response.status)) return MENSAJE_SIN_CONEXION;

  return response.data?.detail || MENSAJE_ERROR_INESPERADO;
}

export function getFieldErrors<TCampo extends string>(
  error: unknown,
): Partial<Record<TCampo, string>> | undefined {
  if (!axios.isAxiosError<ProblemDetails>(error)) return undefined;

  const errors = error.response?.data?.errors ?? {};
  const entries = Object.entries(errors).filter(([, mensajes]) => mensajes.length > 0);
  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries.map(([campo, mensajes]) => [campo, mensajes[0]])) as Partial<
    Record<TCampo, string>
  >;
}
