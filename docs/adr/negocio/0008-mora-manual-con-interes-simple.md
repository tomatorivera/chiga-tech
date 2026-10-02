# La mora se cobra con notas de débito emitidas manualmente, con interés simple

El sistema lista las facturas de cuenta corriente vencidas con saldo pendiente y muestra el interés calculado a la fecha, pero no emite notas de débito automáticamente: un usuario decide cuáles emitir (y puede no cobrarle mora a un cliente). El interés es simple: saldo pendiente de la factura × `configuracion.tasa_mora` (diaria) × días transcurridos desde el vencimiento o desde la última nota de débito por mora de esa factura, la que sea posterior. No se cobra interés sobre notas de débito.

## Consequences

- El interés mostrado en el listado no es deuda hasta que se emite la nota de débito.
- El vencimiento de una factura es la fecha de confirmación de la venta + `configuracion.dias_vencimiento`, editable al confirmar, y se guarda solo en su movimiento de cuenta corriente.
- Se eliminan `metodo_mora` y `periodicidad_mora` de la configuración.
