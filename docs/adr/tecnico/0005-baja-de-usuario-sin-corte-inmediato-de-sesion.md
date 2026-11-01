---
status: accepted
---

# Dar de baja a un usuario no corta su sesión abierta

El ADR 0003 validaba en cada request que el usuario siguiera activo, para cumplir el "efecto inmediato" que pedía ERS 2.3. Se elimina ese control: en este negocio no se da de baja a nadie mientras atiende, porque dejaría el local sin vendedor, y si pasara, el supervisor se queda atendiendo. El sistema solo se usa desde las máquinas del local, sin empleados remotos ni ventas online. Una consulta a la BD por request no se justifica para un caso que difícilmente ocurra.

La baja impide iniciar sesión desde ese momento. Una sesión ya abierta termina con el logout, al cerrar el navegador, al vencer o al recargar la app. La sesión dura 10 h sin actividad, en lugar de 24 h: alcanza para uno o dos turnos en el mismo día y vence durante la noche, siempre que el local esté cerrado más de 10 h.

## Considered Options

- **Duración fija de 10 h, sin expiración deslizante**: descartada. Con dos turnos separados, la sesión podría vencer en medio del segundo.

## Consequences

- Se aceptan estos riesgos: un usuario dado de baja, incluso Administrador o Supervisor, conserva sus permisos en una sesión abierta hasta que termine, y lo que se haga en esa sesión queda registrado a su nombre. El riesgo de daño intencional se considera cubierto por las consecuencias legales y los backups. Estos últimos recuperan datos, pero no deshacen un acceso a información ya consultada.
- Esta decisión depende de dos condiciones que se deben cumplir al desplegar en la nube: restringir el acceso a las máquinas del local y contar con backups. Si el acceso deja de estar restringido, hay que revisarla.
- `GET /auth/me` sigue validando el estado del usuario: si fue dado de baja, responde 401 y borra la cookie. El [contrato 0001](../../contracts/0001-auth.md) indica que el frontend lo llama al cargar la app, por ende recargar la página cierra esa sesión. Los demás endpoints no validan el estado, así que una cookie vigente sigue siendo aceptada por la API hasta que se borre o venza.
- Con la expiración deslizante de ASP.NET Core, la cookie se renueva recién cuando pasó la mitad de su duración. Por eso, según el momento de la última renovación, una sesión sin actividad puede vencer entre 5 y 10 h después de la última request. Una pausa de hasta 5 h entre turnos no la corta.
- Para cerrar todas las sesiones de golpe, se pueden borrar las claves de Data Protection y reiniciar la API (ver ADR 0003). No hay forma de cerrar la sesión de un solo usuario.
