# Especificación de Requisitos de Software (ERS)

- **Sistema:** Gestión Comercial para Casa de Tecnología
- **Versión:** 1.7
- **Fecha:** 25 de septiembre de 2026
- **Norma de referencia:** IEEE 830-1998

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos del sistema web de gestión comercial de una casa de tecnología. Constituye la base verificable para el análisis, diseño, desarrollo, pruebas y aceptación del producto.

Está dirigido al propietario del negocio, usuarios operativos, analistas, desarrolladores y personal de prueba.

### 1.2 Alcance

El sistema reemplazará las planillas de cálculo y registros en papel para administrar usuarios, productos, ubicaciones de depósito, stock, clientes, cuenta corriente, ventas, comprobantes, precios de proveedores, reportes y auditoría.

La aplicación será web y multiusuario. La primera versión operará una sucursal y un depósito, conservando una estructura funcional extensible a futuras sucursales. Permitirá trabajar con comprobantes internos durante el desarrollo y seleccionar, mediante configuración, la emisión fiscal integrada con ARCA/AFIP cuando esté disponible.

### 1.3 Definiciones y abreviaturas

| **Término** | **Definición** |
|---|---|
| ERS | Especificación de Requisitos de Software (este archivo). |
| RF / RNF | Requisito funcional / requisito no funcional. |
| Navegador | Programa para acceder a internet, por ejemplo, Google Chrome, Microsoft Edge, Brave, Mozilla Firefox, entre muchos otros derivados. |
| Usuario | Todo empleado que tenga acceso al sistema. |
| Lista de precios | Archivo digital de un proveedor con códigos, costos y/o precios. |
| Comprobante interno | Documento comercial no fiscal emitido por el sistema. |
| ADR | Registro de decisión de arquitectura: documento breve que explica una decisión de diseño relevante y sus motivos (carpeta docs/adr del repositorio). |
| Autorización | Aprobación registrada que permite una operación que el vendedor no puede decidir solo. |
| Código de supervisor | Código personal y único de un usuario con rol Supervisor o superior que, ingresado en el momento, otorga una autorización. |
| Consumidor Final | Cliente predefinido del sistema que representa a cualquier comprador no registrado; solo compra al contado. |
| Imputación | Aplicación de un crédito (recibo, nota de crédito o saldo a favor) a una deuda concreta de la cuenta corriente. |
| Incidencia de importación | Fila de una lista de precios cuyo código de barras no corresponde a ningún producto y debe resolverse antes de aplicar la lista. |

### 1.4 Referencias

- IEEE 830-1998, *Recommended Practice for Software Requirements Specifications*.
- Registros de decisiones de arquitectura ADR-XXXX, carpeta docs/adr del repositorio del proyecto.

### 1.5 Organización del documento

La sección 2 presenta el contexto general. La sección 3 y 4 contienen los requisitos funcionales y no funcionales respectivamente. La sección 5 define reglas de negocio.

## 2. Descripción general

### 2.1 Perspectiva del producto

El producto será una aplicación web utilizada desde computadoras con navegador y acceso a internet. Tendrá una base de datos única para la sucursal inicial y gestionará documentos internos. Podrá integrarse posteriormente con servicios de facturación fiscal de ARCA/AFIP. Todos los importes se expresan en pesos argentinos (ver ADR-0001).

No forman parte de esta primera versión: comercio electrónico, pasarelas de pago, transferencias entre sucursales, liquidaciones de sueldos, contabilidad integral ni implementación técnica efectiva de la integración fiscal (ver ADR-0010).

### 2.2 Funciones principales

- Administrar usuarios, roles y accesos.
- Administrar productos, códigos de barras, categorías, ubicaciones en el depósito y familias de productos.
- Controlar stock, ingresos, ajustes y alertas de mínimos.
- Administrar clientes, saldos y cuenta corriente.
- Registrar ventas, cobros, notas de crédito y débito.
- Importar listas de proveedores y calcular precios.
- Generar reportes financieros y exportarlos a documentos imprimibles.
- Registrar una auditoría de operaciones relevantes.
- Dar de alta nuevos empleados en el sistema y ajustar sus permisos. (revisar sección “*tipos de usuarios*”)

### 2.3 Tipos de usuarios

| **Rol** | **Responsabilidad principal** |
|---|---|
| Vendedor | Registra ventas en el sistema. |
| Supervisor | Gestiona carga de productos, precio y stock en general. Puede generar y consultar reportes financieros. Autoriza operaciones de excepción con su código de supervisor (ver ADR-0003). |
| Administrador | Puede acceder a todas las funciones del sistema, excepto gestionar a otros Administradores y al Dueño (ver ADR-0011). |
| Dueño | Puede acceder a todas las funciones del sistema y también puede gestionar a los administradores del mismo. |

Notas importantes respecto a los roles de los usuarios:

- Un empleado puede poseer uno o más roles en el sistema. Sus permisos efectivos son la unión de los permisos de sus roles; excepto el administrador que con solo ese rol obtiene acceso a todo.
- Cualquier empleado puede ser dado de baja del sistema en cualquier momento, con efecto inmediato en la restricción de sus accesos.
- Solo puede existir UN dueño en el sistema, para garantizar la seguridad.
- Los usuarios con rol Supervisor o superior poseen un código de supervisor único para autorizar operaciones de excepción (ver ADR-0003).

### 2.4 Restricciones

- El sistema debe poder utilizarse desde navegadores modernos con conexión a internet y desde distintas computadoras.
- Se debe poder operar con comprobantes internos mientras la facturación fiscal no esté habilitada.
- Las operaciones sensibles deberán conservar trazabilidad de usuario, fecha y hora.

### 2.5 Suposiciones y dependencias

- La lista de precios de un proveedor se recibirá en un archivo Excel o CSV con datos estructurados, expresados en pesos argentinos (ver ADR-0001).
- Cada producto poseerá al menos un código de barras válido.
- El límite de crédito será configurable por cliente.
- Un usuario con rol Supervisor o superior podrá autorizar excepciones (crédito excedido, producto o cliente inactivo, descuento mayor al tope y devoluciones) ingresando su código de supervisor (ver ADR-0003).
- Se permitirá vender sin disponibilidad, generando stock negativo y su correspondiente registro.
- La emisión fiscal de facturas depende de que el negocio mismo esté registrado en ARCA.

## 3. Requisitos funcionales

### 3.1 Seguridad, usuarios y auditoría

| **Código** | **Requisito** |
|---|---|
| RF-01 | El sistema deberá permitir a los usuarios ingresar al sistema mediante usuario y contraseña. |
| RF-02 | El sistema deberá permitir al administrador dar de alta, dar de baja, y modificar credenciales de los usuarios del sistema sin eliminar su historial de operaciones. Solo el Dueño puede gestionar usuarios con rol Administrador (ver ADR-0011). |
| RF-03 | El sistema deberá permitir al administrador asignar uno o más roles predefinidos a un usuario (consultar roles en la sección “*Tipos de usuarios*”). Los permisos de cada rol son fijos y no se editan desde la interfaz (ver ADR-0011). |
| RF-04 | El sistema deberá controlar el acceso a cada función según los roles activos del usuario. |
| RF-05 | El sistema deberá registrar y mostrar para auditoría todas las operaciones realizadas por usuarios, como: altas, bajas, modificaciones, ventas y reportes generados. |
| RF-06 | Cada registro de auditoría deberá incluir como mínimo: nombre del usuario, acción, entidad afectada, identificador de la entidad, fecha y hora, y valores anteriores y posteriores cuando corresponda. |
| RF-07 | El sistema deberá permitir al administrador consultar y filtrar las acciones registradas por período, usuario, tipo de acción y entidad. |

### 3.2 Productos, categorías y ubicaciones

| **Código** | **Requisito** |
|---|---|
| RF-08 | El sistema deberá permitir crear, consultar, modificar y dar de baja productos. |
| RF-09 | Cada producto deberá almacenar, como mínimo, nombre, categoría o familia, costo unitario, precio unitario sin IVA, stock actual, stock mínimo, estado (habilitado/deshabilitado) y motivo de baja cuando esté deshabilitado (ver ADR-0013). |
| RF-10 | El sistema deberá exigir al menos un código de barras por producto y permitir registrar códigos de barras adicionales. |
| RF-11 | El sistema deberá impedir que un mismo código de barras activo esté asociado a más de un producto. |
| RF-12 | El sistema deberá permitir crear y administrar categorías o familias de productos. La jerarquía admite como máximo dos niveles, familia y categoría (ver ADR-0002). |
| RF-13 | El sistema deberá permitir definir una única ubicación de depósito por producto, identificada por sector y estante. |
| RF-14 | El sistema deberá mostrar toda la información de los productos a los usuarios autorizados y permitir buscarlos y filtrarlos. |
| ~~RF-15~~ | ~~El sistema deberá permitir buscar productos por nombre, categoría, código de barras y ubicación.~~ |
| ~~RF-16~~ | ~~El sistema deberá permitir modificar precios únicamente a usuarios con autorización para precios.~~ |

### 3.3 Stock y proveedores

| **Código** | **Requisito** |
|---|---|
| RF-17 | El sistema deberá registrar movimientos de stock indicando tipo de movimiento (ingreso, ajuste, venta o devolución), producto, cantidad, proveedor opcional, motivo, usuario responsable, y fecha y hora. |
| RF-18 | El sistema deberá actualizar el stock disponible al confirmar un ingreso, una venta, una devolución con reingreso o un ajuste manual. |
| RF-19 | El sistema deberá permitir ajustes de stock únicamente a usuarios con permiso de gestión de stock, obligando a registrar el motivo (ver ADR-0012). |
| RF-20 | El sistema deberá alertar visualmente los productos cuyo stock disponible sea igual o inferior al stock mínimo configurado. |
| ~~RF-21~~ | ~~El sistema deberá permitir registrar la venta de productos sin stock disponible, conservando el stock resultante negativo.~~ |
| RF-22 | El sistema deberá permitir registrar proveedores y asociarlos con productos a través de los movimientos de stock. |
| RF-23 | El sistema deberá importar listas de precios de proveedores en formato Excel o CSV, vinculando cada fila con un producto por código de barras. Las filas sin coincidencia se presentarán como incidencias a resolver (vincularlas a un producto existente, agregando el código como adicional, o dar de alta un producto nuevo), y la lista se aplicará completa solo cuando no queden incidencias (ver ADR-0009). |
| RF-24 | El sistema deberá calcular precios de venta sugeridos a partir de costos importados y reglas de margen o recargo configurables. El método de cálculo del costo y del margen está pendiente de definición con la cátedra. |
| RF-25 | El sistema deberá permitir al administrador definir, al momento de importar, el formato de la lista del proveedor (hoja, fila inicial y columnas). El formato se conserva en memoria del servidor y no se persiste (ver ADR-0009). |
| ~~RF-25 bis~~ | ~~El sistema deberá permitir revisar, aprobar o rechazar los precios sugeridos antes de aplicarlos masivamente.~~ |

### 3.4 Clientes y cuenta corriente

| **Código** | **Requisito** |
|---|---|
| RF-26 | El sistema deberá permitir crear, consultar, modificar y desactivar clientes. |
| RF-27 | Cada cliente deberá almacenar datos identificatorios y de contacto, límite de crédito cuando tenga cuenta corriente, estado (habilitado/deshabilitado), motivo de baja y una observación. |
| RF-28 | El sistema deberá permitir registrar un saldo inicial deudor o a favor al dar de alta un cliente que maneje cuenta corriente, dejando un movimiento registrado en su cuenta corriente. |
| RF-29 | El sistema deberá mostrar todos los datos de los clientes a los usuarios autorizados y permitir buscarlos y filtrarlos. |
| RF-30 | El sistema deberá permitir dar de alta una cuenta corriente por cliente para poder hacer movimientos de facturas, notas de crédito, notas de débito, recibos de cobro y saldos iniciales. El límite de crédito es obligatorio al dar de alta la cuenta corriente, y el cliente del sistema Consumidor Final no puede tener cuenta corriente (ver ADR-0004). |
| RF-31 | El sistema deberá calcular y mostrar el saldo actual de cada cliente y el total adeudado por la cartera. El saldo se calcula a partir de los movimientos y no se almacena (ver ADR-0005). |
| RF-32 | Antes de confirmar una venta a cuenta corriente, el sistema deberá validar que el nuevo saldo no exceda el límite de crédito del cliente. |
| RF-33 | Si se excede el límite de crédito y no se ingresa en el momento el código de un supervisor, la venta quedará en estado pendiente de autorización sin afectar stock ni cuenta corriente. Pasará a confirmada cuando un usuario con rol Supervisor o superior ingrese su código desde el listado de ventas pendientes, momento en el cual se ejecutan sus efectos de forma atómica, o podrá rechazarse (ver ADR-0003). |
| RF-34 | El sistema deberá permitir emitir recibos de pago e imputarlos a deudas específicas de la cuenta corriente (facturas, notas de débito o saldo inicial). El importe no imputado queda como saldo a favor del cliente y puede imputarse más adelante (ver ADR-0006). |
| RF-35 | El sistema deberá permitir emitir notas de crédito y notas de débito, asociadas al cliente y a la factura que las origina. La nota de crédito por devolución detalla productos y cantidades al precio de la venta original y permite indicar por ítem si reingresa al stock (ver ADR-0007). |
| RF-36 | El sistema deberá listar las facturas de cuenta corriente vencidas con saldo pendiente, mostrar el interés por mora calculado a la fecha y permitir emitir manualmente la nota de débito correspondiente (ver ADR-0008). |

### 3.5 Ventas y comprobantes

| **Código** | **Requisito** |
|---|---|
| RF-37 | El sistema deberá permitir iniciar una venta seleccionando cliente (por defecto, Consumidor Final), condición y medio de pago, productos y cantidades mediante búsqueda o lectura de código de barras. |
| RF-38 | El sistema deberá mostrar durante la venta precio unitario, descuentos autorizados, subtotal, total y disponibilidad de cada producto. |
| RF-39 | El sistema deberá permitir definir la condición de pago de una venta: contado o cuenta corriente. Por defecto es contado; en una venta al contado se registra además un único medio de pago, sin pago mixto. |
| RF-40 | El sistema deberá descontar el stock al confirmar la venta, incluso cuando el producto quede con stock negativo. |
| RF-41 | El sistema deberá emitir un comprobante de venta tras realizarla y conservarlo asociado a dicha operación. |
| RF-42 | El precio total del comprobante de venta deberá expresarse en números y letras, en Pesos Argentinos. |
| RF-43 | El sistema deberá permitir imprimir y exportar a PDF los comprobantes de venta, recibos y notas. |
| RF-44 | El sistema deberá permitir configurar el modo de emisión de comprobantes entre interno y fiscal. En esta versión el modo fiscal se muestra como no disponible (ver ADR-0010). |
| ~~RF-45~~ | ~~En modo fiscal, el sistema deberá preparar y enviar los datos requeridos para la autorización del comprobante por los servicios ARCA/AFIP aplicables, una vez integrada esa funcionalidad.~~ |

### 3.6 Reportes y exportación

| **Código** | **Requisito** |
|---|---|
| RF-46 | El sistema deberá generar reportes de total vendido por día, semana, mes y rango de fechas. |
| RF-47 | El sistema deberá generar reportes de margen de utilidad bruto por período, calculado como ventas netas menos el costo de los productos vendidos. |
| RF-48 | El sistema deberá generar reportes de productos más vendidos globalmente y por familia de productos, para un período seleccionado. La familia de un producto es la categoría padre de su categoría, o su propia categoría si no tiene padre (ver ADR-0002). |
| RF-49 | El sistema deberá generar reportes de clientes más frecuentes, el total vendido a ellos, y de clientes con saldo deudor, incluyendo deuda individual y total. Se excluye al cliente Consumidor Final (ver ADR-0004). |
| RF-50 | El sistema deberá informar el plazo promedio de cobro de ventas a cuenta corriente para un período seleccionado. |
| RF-51 | El sistema deberá permitir filtrar los reportes por período, categoría, cliente y otros criterios pertinentes al informe. |
| RF-52 | El sistema deberá permitir imprimir y exportar los reportes a PDF y Excel. |

## 4. Requisitos no funcionales

| **Código** | **Requisito** |
|---|---|
| RNF-01 | La aplicación deberá ser accesible desde navegadores modernos de escritorio sin requerir instalación local, y desde múltiples computadoras en simultáneo. |
| RNF-02 | Las pantallas de consulta de productos y clientes deberán responder en un máximo de 3 segundos en condiciones normales de operación para búsquedas de hasta 10.000 registros. |
| RNF-03 | El flujo de venta deberá poder completarse usando teclado, lector de código de barras o mouse, sin pasos innecesarios de confirmación. |
| RNF-04 | La interfaz deberá presentar mensajes claros en español y validaciones junto al campo afectado. |
| RNF-05 | Las acciones no permitidas deberán ocultarse o mostrarse deshabilitadas según el rol, sin depender solo de la interfaz para su restricción. |
| RNF-06 | Las contraseñas y sesiones deberán protegerse con mecanismos de seguridad adecuados; no se almacenarán contraseñas en texto plano. |
| RNF-07 | Las operaciones de venta, stock, cuenta corriente y precios deberán ser atómicas: ante un error, no podrán quedar movimientos parciales. |
| RNF-08 | La bitácora de auditoría no podrá ser modificada ni eliminada mediante la interfaz operativa. |
| RNF-09 | La información de una operación confirmada deberá conservar fecha y hora con zona horaria de Argentina. |
| RNF-10 | Los importes deberán manejarse con precisión decimal apta para moneda, evitando errores por redondeo binario. |
| RNF-11 | Los archivos PDF y Excel exportados deberán incluir fecha de generación, filtros aplicados y usuario que los generó. |
| ~~RNF-12~~ | ~~Las operaciones de emisión fiscal deberán poder informar errores de comunicación y dejar la venta identificada para reintento controlado.~~ |
| ~~RNF-13~~ | ~~La solución deberá permitir copias de respaldo y recuperación de los datos sin pérdida de consistencia.~~ |
| RNF-14 | Las pantallas frecuentes deberán priorizar legibilidad, controles grandes y lenguaje no técnico para usuarios con conocimientos informáticos básicos. |
| RNF-15 | La página debe ser navegable por teclado y respetar estándares de accesibilidad de W3 y WCAG, tanto para maquetación como para estilos. |

## 5. Reglas de negocio

Estas son las reglas de negocio más importantes extraídas del enunciado.

| **Código** | **Regla** |
|---|---|
| RN-01 | Un producto activo debe poseer al menos un código de barras activo y único. |
| RN-02 | El stock negativo está permitido como resultado de una venta confirmada o de un ajuste manual realizado por un usuario con permiso de gestión de stock, con motivo obligatorio (ver ADR-0012). |
| RN-03 | El saldo de cuenta corriente se determina por la suma algebraica de sus movimientos: débitos incrementan la deuda y créditos la disminuyen. |
| RN-04 | El saldo inicial debe conservarse como un movimiento de cuenta corriente y no puede editarse; las correcciones se realizan mediante un movimiento de ajuste con motivo. |
| RN-05 | La venta a cuenta corriente se bloquea si el saldo proyectado supera el límite del cliente, salvo autorización registrada de un usuario con rol Supervisor o superior mediante su código (ver ADR-0003). |
| RN-06 | Una nota de débito por mora solo puede emitirse sobre una factura a cuenta corriente vencida y pendiente total o parcialmente. Los días de mora se cuentan desde el vencimiento o desde la última nota de débito por mora de esa factura, la que sea posterior (ver ADR-0008). |
| RN-07 | Los precios resultantes de una lista de proveedor no afectan ventas confirmadas ni pendientes de autorización, que conservan los precios con que se crearon. |
| RN-08 | El margen bruto se calcula con el costo vigente registrado al momento de confirmar la venta, salvo que se defina un método de valuación posterior. |
| RN-09 | El plazo promedio de cobro se calculará como el promedio de días entre la fecha de cada factura a cuenta corriente y la fecha de cancelación total o de cada imputación de cobro, ponderado por importe cobrado. Solo se consideran las imputaciones provenientes de recibos (ver ADR-0006). |
| RN-10 | El modo de emisión configurado determina si una venta genera comprobante interno o requiere autorización fiscal; no puede modificarse retroactivamente en un comprobante confirmado. |
| RN-11 | El vendedor puede aplicar un descuento de hasta el porcentaje configurado (10%) sobre el total de la venta; un descuento mayor requiere autorización con código de supervisor (ver ADR-0003). |
| RN-12 | Una devolución debe referenciar una factura emitida por el sistema, la cantidad devuelta no puede superar la vendida menos lo ya devuelto y requiere la autorización de un Supervisor o superior, que queda registrado como responsable (ver ADR-0007). |
| RN-13 | Todos los productos tributan IVA al 21%; el precio unitario se registra sin IVA y cada ítem vendido conserva la alícuota aplicada (ver ADR-0013). |
| RN-14 | Vender un producto inactivo o a un cliente inactivo requiere autorización con código de supervisor; el sistema muestra el motivo de baja registrado (ver ADR-0003). |
| RN-15 | Toda venta y todo comprobante referencian un cliente; si el comprador no se registra se utiliza el cliente del sistema Consumidor Final (ver ADR-0004). |

## Apéndice A. Formato de los datos de entrada

### A.1 Convenciones del diccionario

Este apéndice reúne los elementos de datos identificados en el enunciado como necesarios para cumplir los requisitos.

| **Columna** | **Significado** |
|---|---|
| Campo | Nombre funcional del dato ingresado o seleccionado. |
| Formato | Tipo y representación esperada. |
| Validación principal | Restricción funcional mínima que debe cumplir el dato. |

### A.2 Usuario

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Nombre de usuario | Texto, 4 a 50 caracteres | Único entre usuarios activos e inactivos. |
| Nombre y apellido | Texto, hasta 120 caracteres | No admitir solo espacios. |
| Correo electrónico | Dirección de correo | Formato válido si se informa. |
| Contraseña inicial | Texto secreto | Cumplir la política de seguridad vigente. |
| Roles | Selección múltiple | Al menos uno entre Vendedor, Supervisor, Administrador y Dueño. |
| Código de supervisor | Texto secreto | Único; solo para usuarios con rol Supervisor o superior; no se almacena en texto plano (ver ADR-0003). |
| Estado | Activo/Inactivo | Un usuario inactivo no puede iniciar sesión. |

### A.3 Rol y permiso

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Rol | Opción predefinida | Solo roles reconocidos por el sistema. |
| Permisos asociados | Conjunto de permisos con formato módulo.acción | Fijos por rol; no se editan desde la interfaz (ver ADR-0011). |
| Descripción | Texto, hasta 250 caracteres | Debe explicar el alcance del rol. |

### A.4 Producto

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Nombre | Texto, hasta 150 caracteres | No admitir solo espacios. |
| Descripción | Texto, hasta 1.000 caracteres | Texto libre. |
| Categoría | Selección de categoría | Debe corresponder a una categoría o familia activa (ver ADR-0002). |
| ~~Código interno~~ | ~~Texto alfanumérico~~ | ~~Único si se informa.~~ |
| Códigos de barras | Lista de textos | Al menos uno; cada código activo debe ser único. |
| Costo unitario / Precio de compra | Importe decimal | Mayor o igual que cero. Obligatorio. |
| Precio unitario de venta (sin IVA) | Importe decimal | Mayor o igual que cero; solo modificable por usuarios autorizados (ver ADR-0013). |
| Stock mínimo de alertas | Número entero | Mayor o igual que cero. |
| ~~Unidad de medida~~ | ~~Selección, por defecto “unidad”~~ | ~~Debe pertenecer al catálogo de unidades habilitadas.~~ |
| Ubicación | Selección | Opcional; una única ubicación por producto. |
| Imagen | Un texto con URL hacia una única JPG/PNG/WebP | Tamaño, cantidad y resolución máximos configurables. |
| Estado | Activo/Inactivo | Venderlo requiere autorización con código de supervisor (ver ADR-0003). |
| Motivo de baja | Texto, hasta 500 caracteres | Obligatorio al desactivar; se muestra al escanear el producto. |
| Observación | Texto, hasta 500 caracteres | Texto libre. |

### A.5 Categoría o familia

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Nombre | Texto, hasta 100 caracteres | Único entre categorías activas. |
| Descripción | Texto, hasta 500 caracteres | Texto libre. |
| Categoría superior | Selección opcional | Máximo dos niveles, familia → categoría (categoría “cpus” dentro de la familia “hardware”); una categoría con padre no puede ser padre de otra (ver ADR-0002). |
| Estado | Activo/Inactivo | Una categoría usada históricamente no se elimina físicamente. |

### A.6 Ubicación de depósito

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| ~~Depósito~~ | ~~Selección~~ | ~~En la primera versión se utiliza el depósito principal.~~ |
| Sector | Texto alfanumérico | Parte de la identificación única de la ubicación. |
| Estante | Texto alfanumérico | Parte de la identificación única de la ubicación. |
| ~~Posición~~ | ~~Texto alfanumérico~~ | ~~Debe permitir ubicar físicamente el producto dentro del estante.~~ |
| ~~Descripción~~ | ~~Texto breve~~ | ~~Referencia complementaria.~~ |
| ~~Estado~~ | ~~Activa/Inactiva~~ | ~~No se asignan nuevos productos a ubicaciones inactivas.~~ |

### A.7 Proveedor

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Razón social o nombre | Texto, hasta 150 caracteres | No admitir solo espacios. |
| CUIT | 11 dígitos | Validar formato y dígito verificador si se informa. |
| Teléfono | Texto normalizado | Admitir característica y número. |
| Correo electrónico | Dirección de correo | Formato válido si se informa. |
| Dirección | Texto, hasta 250 caracteres | Texto libre. |
| ~~Estado~~ | ~~Activo/Inactivo~~ | ~~Un proveedor inactivo conserva su historial.~~ |

### A.8 Lista de precios de proveedor

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Proveedor | Selección |  |
| Archivo | XLSX o CSV | Debe respetar tamaño y estructura admitidos. |
| Hoja | Nombre o índice | Requerido si el libro contiene varias hojas. |
| Columna identificadora | Código de barras | Si no coincide con un producto, genera una incidencia a resolver (ver ADR-0009). |
| Columna de costo | Importe decimal | Mayor o igual que cero. |
| ~~Moneda~~ | ~~Código de moneda~~ | ~~Debe estar habilitada; por defecto, moneda local.~~ |
| Regla de precio | Margen o recargo porcentual | Debe ser una regla activa y válida. Pendiente de definición con la cátedra. |
| Fecha de vigencia | Fecha | No puede ser anterior a la fecha mínima admitida por política. |

### A.9 Movimiento de stock

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Tipo de movimiento | Ingreso/Ajuste/Venta/Devolución | Debe ser coherente con la operación origen. |
| Producto | Selección o código de barras | Debe existir y estar habilitado para la operación. |
| Cantidad | Número entero | Mayor que cero; el sentido lo determina el tipo. |
| ~~Ubicación~~ | ~~Selección~~ | ~~Debe estar activa.~~ |
| ~~Costo unitario~~ | ~~Importe decimal~~ | ~~Mayor o igual que cero.~~ |
| Proveedor | Selección | Si se informa, debe estar activo. |
| Motivo | Texto, hasta 500 caracteres | Obligatorio en movimientos manuales. |
| Usuario responsable | Usuario con permiso de gestión de stock | Siempre requerido; en devoluciones es el supervisor que autoriza (ver ADR-0012). |
| Fecha y hora | Fecha y hora del sistema | Se genera automáticamente y no se edita. |
| Operación de origen | Referencia | Venta o nota de crédito que originó el movimiento, cuando corresponda. |

### A.10 Cliente y datos de facturación

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Tipo de persona | Física/Jurídica | Determina las validaciones fiscales aplicables. |
| Nombre y apellido o razón social | Texto, hasta 180 caracteres | Debe corresponder con la identificación fiscal cuando se emita comprobante fiscal. |
| Tipo de documento | DNI/CUIT/CUIL/Pasaporte/Otro | Debe ser compatible con el número informado. |
| Número de documento | Texto normalizado | Validar longitud y formato según el tipo. |
| Condición frente al IVA | Selección fiscal | Debe pertenecer al catálogo fiscal vigente. |
| Domicilio de facturación | Texto, hasta 250 caracteres | Incluir calle, número, localidad, provincia y código postal cuando corresponda. |
| Teléfono | Texto normalizado | Formato válido si se informa. |
| Correo electrónico | Dirección de correo | Formato válido si se informa. |
| ~~Condición de pago predeterminada~~ | ~~Contado/Cuenta corriente~~ | ~~Cuenta corriente requiere límite de crédito definido.~~ |
| Límite de crédito | Importe decimal | Obligatorio si tiene cuenta corriente; mayor o igual que cero. |
| Saldo inicial | Importe decimal con signo | Cero, deudor o a favor; genera un movimiento inmutable. |
| Estado | Activo/Inactivo | Un cliente inactivo conserva su historial; venderle requiere autorización con código de supervisor (ver ADR-0003). |
| Motivo de baja | Texto, hasta 500 caracteres | Obligatorio al desactivar. |
| Observación | Texto, hasta 500 caracteres | Texto libre. |

### A.11 Venta e ítem de venta

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Cliente | Selección | Por defecto, el cliente del sistema Consumidor Final, solo contado (ver ADR-0004); un cliente inactivo requiere autorización. |
| Condición de pago | Contado/Cuenta corriente | Debe respetar el límite de crédito y las autorizaciones. |
| Medio de pago | Efectivo/Transferencia/Tarjeta/Otro | Obligatorio si la condición es contado; un único medio por venta. |
| Producto | Selección o código de barras | Si está inactivo, requiere autorización con código de supervisor. |
| Cantidad | Número entero | Mayor que cero. |
| Precio unitario | Importe decimal | Se toma del precio sin IVA vigente al crear la venta y se conserva aunque quede pendiente; cambios requieren permiso. |
| Descuento | Porcentaje sobre el total de la venta | Hasta el 10% sin autorización; por encima requiere código de supervisor (ver ADR-0003). |
| Subtotal | Importe calculado | Se calcula por ítem y no se ingresa manualmente. |
| Total | Importe calculado | Debe coincidir con la suma de ítems y ajustes. |
| Vencimiento | Fecha | Solo cuenta corriente; por defecto, fecha de confirmación más los días configurados, editable al confirmar (ver ADR-0008). |
| Observaciones | Texto, hasta 500 caracteres | Texto libre sin datos ejecutables. |
| Estado | Enum | Pendiente de autorización, confirmada o rechazada; una venta confirmada no se modifica (ver ADR-0003). |
| Vendedor | Referencia | Usuario que registra la venta; se completa automáticamente. |
| Alícuota de IVA | Porcentaje | 21% por ítem; se conserva aunque cambie la configuración (ver ADR-0013). |

### A.12 Comprobante

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Modo de emisión | Interno/Fiscal | Se toma de la configuración vigente. |
| Tipo | Factura/Nota de crédito/Nota de débito/Recibo | Debe corresponder con la operación origen. |
| Punto de venta | Número | En modo interno se utiliza el punto de venta 1. |
| Número | Secuencia numérica | Único dentro de tipo, modo y punto de venta. |
| Fecha de emisión | Fecha y hora | Generada por el sistema. |
| ~~Moneda~~ | ~~Código de moneda~~ | ~~Debe coincidir con los importes informados.~~ |
| Importe total numérico | Importe decimal | Calculado por el sistema. |
| Importe total en letras | Texto generado | Debe corresponder exactamente con el total en pesos argentinos. |
| ~~Datos fiscales de autorización~~ | ~~CAE, vencimiento y respuesta~~ | ~~Se almacenan sin modificación cuando ARCA/AFIP los devuelve.~~ |
| Cliente | Referencia | Obligatorio; Consumidor Final cuando no se registra al comprador (ver ADR-0004). |
| Comprobante de origen | Referencia | Obligatorio en notas de crédito y débito; siempre una factura. |
| Usuario emisor | Referencia | Usuario que emite el comprobante; en devoluciones, el supervisor que autoriza (ver ADR-0007). |

### A.13 Movimiento de cuenta corriente y cobro

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Cliente | Selección | Debe poseer cuenta corriente. |
| Tipo de movimiento | Saldo inicial/Factura/NC/ND/Recibo/Ajuste | Junto con el sentido (débito o crédito) determina si incrementa o disminuye la deuda. |
| Sentido | Débito/Crédito | Lo determina el tipo; en saldo inicial y ajustes se indica explícitamente (ver ADR-0006). |
| Comprobante relacionado | Referencia | Obligatorio cuando el movimiento deriva de otro comprobante. |
| Importe | Decimal positivo | El signo contable lo determina el tipo de movimiento. |
| Fecha de vencimiento | Fecha | Solo débitos; igual o posterior a la emisión. |
| Imputaciones | Lista de deuda (movimiento de débito) e importe | La suma imputada no puede superar el crédito ni el saldo pendiente de cada deuda (ver ADR-0006). |
| Medio de pago | Efectivo/Transferencia/Tarjeta/Otro | Debe pertenecer al catálogo habilitado. |
| Observación o motivo | Texto, hasta 500 caracteres | Obligatorio para notas y ajustes. |

### A.14 Autorización

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Tipo | Selección | Crédito excedido, producto inactivo, cliente inactivo, descuento o devolución. |
| Operación | Referencia | Venta o nota de crédito que requiere la autorización. |
| Datos de contexto | Importes calculados | No editables (p. ej. saldo proyectado y límite vigente). |
| Estado | Pendiente/Aprobada/Rechazada | Una autorización resuelta no se modifica. |
| Motivo | Texto, hasta 500 caracteres | No admitir solo espacios. |
| Autorizador | Usuario con rol Supervisor o superior | Se identifica con su código de supervisor y debe estar activo (ver ADR-0003). |
| Solicitante | Referencia | Usuario que pidió la autorización. |
| Fecha y hora | Fecha y hora del sistema | No editable. |

### A.15 Consulta y reporte

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Tipo de reporte | Selección | Solo mostrar reportes autorizados para el usuario. |
| Fecha desde | Fecha | No posterior a fecha hasta. |
| Fecha hasta | Fecha | No anterior a fecha desde. |
| Categoría | Selección | Debe existir si se informa. |
| Producto | Selección | Debe existir si se informa. |
| Cliente | Selección | Debe existir si se informa. |
| Usuario | Selección | Disponible solo donde corresponda y según permisos. |
| Formato de salida | Pantalla/PDF/Excel/Impresión | Debe ser compatible con el reporte. |

### A.16 Configuración del sistema

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Modo de comprobante | Interno/Fiscal | Solo modificable por Administrador. |
| ~~Moneda predeterminada~~ | ~~Código de moneda~~ | ~~Debe estar habilitada.~~ |
| Regla de precio predeterminada | Margen o recargo | Porcentaje dentro del rango permitido. Pendiente de definición con la cátedra. |
| Umbrales de archivo | Tamaño y cantidad máximos | Valores positivos. |
| Parámetros de mora | Tasa diaria y días de vencimiento | Interés simple sobre el saldo pendiente de la factura (ver ADR-0008). |
| Parámetros fiscales | Punto de venta y ambiente | Sin uso en esta versión; no se almacenan credenciales (ver ADR-0010). |
| Descuento máximo del vendedor | Porcentaje, por defecto 10% | Por encima requiere autorización (ver ADR-0003). |
| Alícuota de IVA | Porcentaje, por defecto 21% | Única para todos los productos (ver ADR-0013). |

### A.17 Auditoría

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Usuario | Referencia inmutable | Usuario responsable de la acción. |
| Acción | Código de acción | Debe pertenecer al catálogo auditable. |
| Entidad e identificador | Texto y referencia | Debe identificar el objeto afectado. |
| Fecha y hora | Fecha y hora del sistema | Registrar zona horaria de Argentina. |
| Valores anteriores | Estructura de datos | No editable desde la interfaz. |
| Valores posteriores | Estructura de datos | No editable desde la interfaz. |
| Motivo o autorización | Texto o referencia | Obligatorio en excepciones y ajustes sensibles. |

### A.18 Ítem de nota de crédito

| **Campo** | **Formato** | **Validación principal** |
|---|---|---|
| Factura de origen | Referencia | Obligatoria; debe ser una factura emitida por el sistema (ver ADR-0007). |
| Producto | Selección o código de barras | Debe figurar en la factura de origen. |
| Cantidad | Número entero | Mayor que cero; no puede superar la cantidad vendida menos lo ya devuelto. |
| Precio unitario | Importe calculado | Se toma de la venta original; no editable. |
| Alícuota de IVA | Porcentaje | Se toma de la venta original (ver ADR-0013). |
| Reingresa al stock | Sí/No | Si es No, el producto se aparta para revisión y no genera movimiento de stock. |
| Autorizador | Usuario con rol Supervisor o superior | Se identifica con su código de supervisor y queda como responsable (ver ADR-0003). |
| Medio de pago del reembolso | Efectivo/Transferencia/Tarjeta/Otro | Obligatorio si la venta original fue al contado. |
