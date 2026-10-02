# La matriz de permisos por rol es fija

Los permisos tienen la forma `modulo.accion` y se asignan a los cuatro roles predefinidos (Vendedor, Supervisor, Administrador, Dueño) mediante datos iniciales, sin pantalla para editarlos. Desde la interfaz solo se asignan roles a usuarios. Una matriz editable agregaba mucha superficie (validaciones, auditoría, riesgo de dejar el sistema sin administradores) sin un pedido real del cliente.

## Consequences

- Un Administrador gestiona usuarios que no son Administrador ni Dueño; solo el Dueño gestiona Administradores. El rol Dueño es único y no puede quitarse sin transferirlo.
- El código de autorización lo tienen los usuarios con rol Supervisor o superior (ver ADR 0003).
