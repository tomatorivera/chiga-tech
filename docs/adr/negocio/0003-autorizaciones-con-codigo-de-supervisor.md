# Autorizaciones con código de supervisor registradas en una tabla genérica

Las operaciones que un vendedor no puede decidir solo (crédito excedido, producto inactivo, cliente inactivo, descuento mayor al tope, devolución) se autorizan ingresando el código personal de un usuario con rol Supervisor o superior, en el momento y sin cambiar de sesión. Cada autorización se registra en una única tabla `autorizacion` (tipo, solicitante, autorizador, estado, motivo, datos en JSON) en lugar de una tabla por tipo de excepción, porque los tipos comparten estructura y se fueron sumando casos durante el análisis.

## Considered Options

- **Una tabla por tipo (`excepcion_credito`)**: descartada; habría requerido una tabla nueva por cada caso (producto inactivo, cliente inactivo, descuento, devolución).
- **Que el supervisor inicie sesión para aprobar**: descartada; interrumpe la venta en el mostrador (RNF-03).

## Consequences

- Una venta que requiere autorización y no la obtiene en el momento queda en `PENDIENTE_AUTORIZACION`; solo pasa a `CONFIRMADA` cuando un supervisor ingresa su código desde el listado de pendientes, o a `RECHAZADA`. Mientras está pendiente no afecta stock ni cuenta corriente y conserva los precios con que se creó.
- El código se guarda como hash determinístico (p. ej. HMAC-SHA256 con un secreto del servidor) para poder identificar al autorizador solo por el código y garantizar unicidad; un hash con sal aleatoria (bcrypt) no lo permitiría.
- El descuento de hasta `configuracion.descuento_max_vendedor` (10%) no requiere autorización; por encima, sí.
