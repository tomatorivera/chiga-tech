---
status: accepted
---

# La sesión se maneja con la autenticación por cookie de ASP.NET Core, no con JWT

El usuario inicia sesión con nombre de usuario y contraseña (RF-01). El backend responde con una cookie `HttpOnly`, `Secure` y `SameSite=Strict` que genera `AddCookie()` de ASP.NET Core: contiene los claims del usuario cifrados y firmados, y el navegador la manda sola en cada request. Se eligió porque el sistema tiene una sola API y una sola SPA, así que la ventaja principal de JWT (que varios servicios validen el mismo token sin compartir estado) no aplica. Además, con la cookie JavaScript nunca toca la credencial y el logout la invalida de verdad.

## Considered Options

- **JWT en `localStorage` con header `Authorization: Bearer`**: descartada. Cualquier script inyectado en la página (XSS) puede leer el token, y el logout solo lo descarta en el cliente: el token sigue siendo válido hasta que vence.
- **JWT dentro de una cookie `HttpOnly`**: descartada. Tiene la misma seguridad que la cookie de ASP.NET, pero hay que manejar a mano el secreto, la emisión y la lectura del token desde la cookie.
- **Sesión guardada en la BD**: descartada por ahora. Permite listar y cerrar sesiones activas, pero nadie lo pidió.

## Consequences

- El frontend y la API se sirven desde el mismo origen. En desarrollo, Vite hace de proxy de `/api` y `/auth` hacia el backend, así no hace falta configurar CORS con credenciales.
- Dar de baja a un usuario corta su acceso de inmediato (ERS 2.3): `OnValidatePrincipal` consulta en cada request si el usuario sigue activo y, si no, rechaza la cookie. Es una consulta por id con clave primaria.
- Las claves con las que ASP.NET cifra la cookie (Data Protection) se guardan en un directorio persistente. Si se pierden, por ejemplo al recrear el contenedor, todas las sesiones se cierran.

## Pending

No se definió lo siguiente:

- Duración de la sesión (por defecto usaremos 24 hs, todavía no lo analizamos)