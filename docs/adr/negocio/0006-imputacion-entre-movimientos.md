# La imputación vincula cualquier movimiento de crédito con cualquier movimiento de débito

La tabla `imputacion` relaciona un movimiento de crédito de la cuenta corriente (recibo, nota de crédito, saldo inicial a favor, ajuste a favor) con un movimiento de débito (factura, nota de débito, saldo inicial deudor, ajuste en contra), en lugar de relacionar solo recibos con facturas. Con el diseño anterior, las notas de débito por mora y los saldos iniciales deudores nunca podían cancelarse, y los créditos que no eran recibos bajaban el saldo sin cancelar ninguna factura, que seguía figurando como vencida.

## Consequences

- El saldo pendiente de una factura es su importe menos lo imputado a su movimiento de débito.
- El remanente sin imputar de un crédito es el saldo a favor del cliente (incluido el "vuelto" de RF-34); no hace falta un campo aparte y puede imputarse más adelante.
- El plazo promedio de cobro (RN-09) considera solo las imputaciones cuyo crédito proviene de un recibo.
- `movimiento_cuenta_corriente` necesita un campo `sentido` (DEBITO/CREDITO), porque el saldo inicial y los ajustes pueden ir en cualquiera de los dos sentidos.
