# Las devoluciones se documentan con una nota de crédito con ítems y reingreso opcional

Una devolución siempre referencia una factura emitida por el sistema y se documenta con una nota de crédito que detalla productos y cantidades (`item_nota`), al precio y la alícuota de la venta original. La autoriza un Supervisor o superior, que queda registrado como responsable (usuario del comprobante y del movimiento de stock). Por cada ítem se decide si reingresa al stock (movimiento `DEVOLUCION`) o si se aparta como fallado para revisión, sin modelar un stock "en revisión".

## Consequences

- La cantidad devuelta de un producto no puede superar la vendida en la factura menos lo ya devuelto.
- Si la venta fue a cuenta corriente, la nota de crédito genera un crédito en la cuenta; si fue al contado, registra el medio de pago del reembolso y no toca ninguna cuenta.
- Las devoluciones de ventas anteriores al sistema quedan fuera de alcance.
- Un producto apartado y luego reparado vuelve al stock con un ajuste.
