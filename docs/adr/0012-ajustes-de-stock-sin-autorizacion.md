# Los ajustes de stock no requieren autorización, solo permiso

Los ingresos y ajustes manuales de stock solo pueden hacerlos usuarios con el permiso correspondiente, con motivo obligatorio, y no pasan por un circuito de autorización aunque dejen el stock en negativo. Quien carga el movimiento es el responsable (`movimiento_stock.id_usuario`). Esto se aparta de la versión anterior del ERS (RF-19, RN-02) porque esos usuarios ya son quienes podrían autorizar, y una doble aprobación no agregaba control.

## Consequences

- En las devoluciones, el supervisor que autoriza queda registrado como el usuario que cargó el movimiento.
