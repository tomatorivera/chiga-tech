# Gestión Comercial — Casa de Tecnología

Sistema web de gestión de ventas, stock, clientes y cuenta corriente para una casa de tecnología con una sucursal y un depósito. Todos los importes se expresan en pesos argentinos (ARS).

## Catálogo

**Producto**:
Artículo que se vende, identificado por uno o más códigos de barras y clasificado en una única categoría.
_Avoid_: Artículo, ítem (fuera de una venta)

**Categoría**:
Agrupación de productos del mismo tipo (p. ej. "CPUs", "GPUs", "Discos").
_Avoid_: Rubro, tipo

**Familia**:
Categoría de nivel superior que agrupa otras categorías (p. ej. "Hardware" agrupa "CPUs" y "GPUs"). Una familia es una categoría sin categoría padre.
_Avoid_: Grupo, supercategoría

**Ubicación**:
Lugar único del depósito (sector + estante) donde se guarda un producto; sirve solo para encontrarlo físicamente.
_Avoid_: Posición, depósito

**Lista de precios de proveedor**:
Archivo Excel/CSV de un proveedor cuya importación actualiza precios de productos; nunca modifica stock. Se aplica completa o no se aplica.
_Avoid_: Ingreso de mercadería, remito

**Incidencia de importación**:
Fila de una lista de precios cuyo código de barras no corresponde a ningún producto; debe resolverse (vincular a un producto existente o dar de alta uno nuevo) antes de aplicar la lista.
_Avoid_: Fila rechazada, error de importación

**Precio unitario**:
Precio de venta de un producto sin IVA. El precio final es el precio unitario más el IVA (21% para todos los productos).
_Avoid_: Precio de lista, PVP

## Ventas y cobros

**Venta**:
Operación por la que se entregan productos a cambio de dinero o deuda. Puede estar pendiente de autorización, confirmada o rechazada; una venta confirmada es inmutable.
_Avoid_: Pedido, orden, ticket

**Descuento**:
Porcentaje único aplicado al total de una venta; hasta el 10% lo decide el vendedor, por encima requiere autorización.
_Avoid_: Bonificación, rebaja

**Consumidor final**:
Cliente predefinido del sistema que representa a cualquier comprador no registrado; solo compra al contado.
_Avoid_: Cliente genérico, cliente anónimo

**Condición de pago**:
Forma en que la venta queda saldada: contado o cuenta corriente.
_Avoid_: Método de pago, forma de pago

**Medio de pago**:
Instrumento con el que se paga dinero (efectivo, transferencia, tarjeta, otro). Una operación usa un único medio de pago; no hay pago mixto.
_Avoid_: Método de pago

**Devolución**:
Reingreso de productos de una factura del sistema, documentado con una nota de crédito al precio original y autorizado por un supervisor, que queda como responsable. El reingreso al stock es opcional (un producto fallado puede apartarse para revisión).
_Avoid_: Cambio, retorno

**Nota de débito por mora**:
Comprobante que cobra interés simple sobre el saldo pendiente de una factura vencida, por los días transcurridos desde el vencimiento o desde la última nota de débito por mora de esa misma factura.
_Avoid_: Recargo, multa, punitorio

**Imputación**:
Aplicación de (parte de) un recibo a una deuda concreta de la cuenta corriente: una factura, una nota de débito o el saldo inicial.
_Avoid_: Aplicación de pago, cancelación

## Seguridad

**Autorización**:
Aprobación registrada que permite una operación que el vendedor no puede decidir solo (crédito excedido, producto o cliente inactivo, devolución).
_Avoid_: Excepción, override

**Código de supervisor**:
Código personal y único de un usuario con rol Supervisor o superior que, ingresado en el momento, otorga una autorización.
_Avoid_: PIN, clave de autorización
