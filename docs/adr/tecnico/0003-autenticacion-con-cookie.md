---
status: accepted
---

# La sesión se maneja con la autenticación por cookie de ASP.NET Core, no con JWT

El usuario inicia sesión con nombre de usuario y contraseña (RF-01). El backend responde con una cookie `HttpOnly`, `Secure` y `SameSite=Strict` que genera `AddCookie()` de ASP.NET Core: contiene los claims del usuario cifrados y firmados, y el navegador la manda sola en cada request. Se eligió porque el sistema tiene una sola API y una sola SPA, así que la ventaja principal de JWT (que varios servicios validen el mismo token sin compartir estado) no aplica. Además, con la cookie JavaScript nunca toca la credencial.

La sesión dura 10 hs sin actividad y es NO persistente (ver [ADR 0005](0005-baja-de-usuario-sin-corte-inmediato-de-sesion.md)).

## Considered Options

- **JWT en `localStorage` con header `Authorization: Bearer`**: descartada. Cualquier script inyectado en la página (XSS) puede leer el token.
- **JWT dentro de una cookie `HttpOnly`**: descartada. Tiene la misma seguridad que la cookie de ASP.NET, pero hay que manejar a mano el secreto, la emisión y la lectura del token desde la cookie.
- **Sesión guardada en la BD**: descartada por ahora. Permite listar y cerrar sesiones activas, pero nadie lo pidió.
- **Sesiones cerradas en memoria y en una tabla**: descartada por ahora. Mantiene las sesiones abiertas al reiniciar la API, pero suma una migración y una escritura en cada logout.

## Consequences

- El frontend y la API se sirven desde el mismo origen. En desarrollo, Vite hace de proxy de `/api` y `/auth` hacia el backend, así no hace falta configurar CORS con credenciales.
- Dar de baja a un usuario impide nuevos inicios de sesión, pero no corta de inmediato una sesión abierta (ver [ADR 0005](0005-baja-de-usuario-sin-corte-inmediato-de-sesion.md)).
- Las claves con las que ASP.NET cifra la cookie (Data Protection) se guardan en un directorio persistente: por defecto `backend/Chiga.Api/keys/`, ignorado por git porque son secretas, y se cambia con `DataProtection:KeysPath` (variable de entorno `DataProtection__KeysPath`). Si se borran o se pierden, por ejemplo al recrear el contenedor, la API genera otras y ninguna cookie anterior se puede leer.
- Cada cookie lleva un identificador de sesión (`sid`) y la API guarda en memoria las sesiones abiertas (`ActiveSessions`). `OnValidatePrincipal` busca el `sid` en cada request, sin consultar la BD, y rechaza la cookie si no está. Así, el logout también invalida las copias de la cookie.
- Reiniciar la API cierra todas las sesiones: hay que volver a iniciar sesión. Si la API corre en más de una instancia hay que revisar esta decisión, porque cada una tiene su propia memoria.
- La sesión se pierde cuando se cierra el navegador, para el contexto de uso del sistema no parece ser un problema.
- JavaScript no puede leer la cookie, así que el frontend guarda el usuario en un store en memoria y lo recupera con `GET /auth/me` en el `loader` de las rutas de la app, una sola vez por carga. Esas rutas no se renderizan hasta que termina, por lo que el login no aparece un instante antes del inicio. `/login` queda afuera del `loader` para no consultar `/auth/me`: si se abre directo con una cookie vigente, muestra el formulario. Cualquier error de esa llamada, no solo un 401, deja la app sin sesión: una caída momentánea del backend lleva al login aunque la cookie siga vigente.
- Ante un 401, un interceptor que la feature `auth` registra en `main.tsx` sobre el cliente HTTP compartido solo limpia el store, salvo en `/auth/login`, y `AuthGuard` hace la redirección. Así `shared/` no depende de `auth` ni del router.
- `AuthGuard` le pasa al login la ruta pedida para volver a ella después de ingresar, cuando se entra sin sesión o la sesión vence. El logout voluntario, en cambio, recarga la app desde `/login`: no queda ruta a la que volver y se borra todo el estado en memoria, a costa de volver a cargar la app.
- Si el navegador restaura la página desde bfcache, el frontend la recarga para volver a validar la sesión.