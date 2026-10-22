# Formato de error

Todas las respuestas de error de la API salen como **ProblemDetails** ([RFC 9457](https://www.rfc-editor.org/rfc/rfc9457)), con `Content-Type: application/problem+json`. El frontend lee `status`, `title`, `detail` y, en validaciones, `errors`. Los contratos solo indican qué códigos HTTP devuelve cada endpoint, no repiten el cuerpo.

Error con mensaje para el usuario (401, 404, 409...):

```json
{ "status": 401, "title": "Unauthorized", "detail": "Mensaje para el usuario." }
```

Error de validación (400), que genera `[ApiController]` solo:

```json
{
  "status": 400,
  "title": "One or more validation errors occurred.",
  "errors": { "Username": ["The Username field is required."] }
}
```

Ruta inexistente (404) y excepción no manejada (500) también salen en este formato. El 500 no incluye stack trace ni el mensaje de la excepción fuera de Development.

Tipo en el frontend:

```ts
interface ProblemDetails {
  status: number;
  title: string;
  detail?: string;
  errors?: Record<string, string[]>;
}
```