# Todos los productos tributan IVA al 21% y el precio se guarda sin IVA

`producto.precio_unitario` es el precio neto; el precio final se calcula con una alícuota única del 21% (`configuracion.alicuota_iva`). Aunque en Argentina muchos productos de informática tributan 10,5%, se decidió una alícuota única para simplificar. Cada `item_venta` e `item_nota` congela la alícuota aplicada, de modo que un cambio futuro no altere comprobantes emitidos y las ventas netas del reporte de margen (RF-47) sean la suma de los netos.
