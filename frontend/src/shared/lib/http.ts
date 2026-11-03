import axios from "axios";
import type { ProblemDetails } from "../types/api.types";

export const http = axios.create();

export const NO_CONNECTION_MSG =
  "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
export const UNEXPECTED_ERROR_MSG = "Ocurrió un error inesperado. Intentá de nuevo.";

// Convierte cualquier error de una request en un mensaje para el usuario. El backend redacta los mensajes
export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ProblemDetails>(error)) return UNEXPECTED_ERROR_MSG;

  const { response } = error;

  if (!response || [502, 503, 504].includes(response.status)) return NO_CONNECTION_MSG;

  return response.data?.detail || UNEXPECTED_ERROR_MSG;
}

export function getFieldErrors<TField extends string>(
  error: unknown,
): Partial<Record<TField, string>> | undefined {
  if (!axios.isAxiosError<ProblemDetails>(error)) return undefined;

  const errors = error.response?.data?.errors ?? {};
  const entries = Object.entries(errors).filter(([, messages]) => messages.length > 0);
  if (entries.length === 0) return undefined;

  return Object.fromEntries(entries.map(([campo, mensajes]) => [campo, mensajes[0]])) as Partial<
    Record<TField, string>
  >;
}
