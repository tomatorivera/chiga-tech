# Matriz de permisos fija por rol y acceso por rol mínimo

Los permisos tienen la forma `modulo.accion` y se asignan a los cuatro roles predefinidos (Vendedor, Supervisor, Administrador, Dueño) mediante datos iniciales, sin pantalla para editarlos. Desde la interfaz solo se asignan roles a usuarios. Una matriz editable agregaba mucha superficie (validaciones, auditoría, riesgo de dejar el sistema sin administradores) sin un pedido real del cliente.

En la práctica, ninguna pantalla ni operación los necesita: las excepciones que surgen durante la atención, como vender un producto inactivo, se resuelven con el código de supervisor (ver ADR 0003), y no se piensa dar permisos especiales a usuarios puntuales. Por eso el acceso se decide por la jerarquía de roles: Vendedor, Supervisor, Administrador y Dueño. Cada pantalla y cada endpoint exige un rol mínimo, que cumple cualquier usuario con ese rol o uno superior; si el usuario tiene varios roles, alcanza con que uno lo cumpla.

## Considered Options

- **Autorizar por permisos granulares**: descartada por ahora. Frontend y backend tendrían que mantener sincronizada la matriz completa, en lugar de una lista de cuatro roles, sin un caso que lo justifique. Las tablas `permiso` y `rol_permiso` se conservan y se va a reconsiderar si aparece una necesidad que el rol mínimo no pueda expresar.

## Consequences

- Un Administrador gestiona usuarios que no son Administrador ni Dueño; solo el Dueño gestiona Administradores. El rol Dueño es único y no puede quitarse sin transferirlo.
- El código de autorización lo tienen los usuarios con rol Supervisor o superior (ver ADR 0003).
- La jerarquía está escrita en el frontend y en el backend. Cambiar un rol implica actualizar los dos. Decide el backend: el frontend solo oculta lo que el usuario no puede usar.
- Los roles se guardan en la cookie al iniciar sesión, así que un cambio de rol se aplica recién en la siguiente sesión, igual que una baja (ver ADR técnico 0005).
