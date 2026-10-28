import axios from "axios";

export const http = axios.create();

interface ProblemDetails {
  status?: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

export const MENSAJE_SIN_CONEXION =
  "No se pudo conectar con el servidor. Revisá tu conexión e intentá de nuevo.";
export const MENSAJE_ERROR_INESPERADO = "Ocurrió un error inesperado. Intentá de nuevo.";

// Convierte cualquier error de una request en un mensaje para el usuario. El backend redacta los mensajes
export function getErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ProblemDetails>(error)) return MENSAJE_ERROR_INESPERADO;

  const { response } = error;

  if (!response || [502, 503, 504].includes(response.status)) return MENSAJE_SIN_CONEXION;

  const { detail, errors } = response.data ?? {};

  if (detail) return detail;
  if (errors) return Object.values(errors).flat().join(" ");

  return MENSAJE_ERROR_INESPERADO;
}
