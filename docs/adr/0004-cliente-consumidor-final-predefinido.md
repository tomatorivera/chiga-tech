# Las ventas sin cliente registrado usan un cliente predefinido "Consumidor Final"

Toda venta y todo comprobante referencian un cliente (`id_cliente NOT NULL`). Para vender sin registrar al comprador se usa un cliente del sistema, "Consumidor Final", marcado con `cliente.es_sistema = true`. Se consideró dejar `id_cliente` en NULL (menos lógica de protección), pero un comprobante sin destinatario resultaba incoherente y obligaba a casos especiales en facturas, notas y reportes.

## Consequences

- El cliente del sistema no se puede editar, desactivar ni tener cuenta corriente, por lo que sus ventas son siempre al contado.
- Se preselecciona en el flujo de venta y se excluye del reporte de clientes más frecuentes (RF-49).
