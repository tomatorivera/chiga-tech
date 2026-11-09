# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas que atienden el mostrador de una casa de computación: de 20 a 70 años, algunas usan la computadora todos los días y otras solo para esto, y casi siempre tienen un cliente esperando. Cada usuario tiene uno o más de cuatro roles fijos:

- **Vendedor:** registra ventas.
- **Supervisor:** carga productos, precios y stock, consulta reportes financieros y autoriza excepciones con su código de supervisor.
- **Administrador:** accede a todo, salvo gestionar a otros Administradores y al Dueño.
- **Dueño:** único; accede a todo y gestiona a los Administradores.

## Product Purpose

Punto de venta y gestión comercial: vender rápido en el mostrador, controlar stock y precios, llevar las cuentas corrientes de los clientes y ver reportes de ventas, margen y deuda. Tiene éxito si una venta se cobra sin demoras y si quien atiende entiende cada pantalla leyéndola, sin probar.

## Operating Context

- Monitores de escritorio, principalmente de 1366×768. No hay versión móvil.
- Se opera con teclado, mouse y lector de código de barras.
- Las excepciones (crédito excedido, producto o cliente inactivo, descuento mayor al tope, devoluciones) se autorizan en el momento con el código de un supervisor, o quedan pendientes de autorización.

## Capabilities and Constraints

- Requisitos en `docs/ERS.md`, términos en `docs/CONTEXT.md`, decisiones en `docs/adr/`.
- La primera versión opera una sucursal y un depósito. **Multi-sucursal todavía no está contemplado, pero es un requisito probable a corto plazo**: la interfaz no debería cerrarle el paso (por ejemplo, dejando lugar para mostrar la sucursal activa).
- Los permisos por rol son fijos (ADR-0011). Lo que un rol no puede hacer se oculta o se deshabilita.
- Comprobantes internos; la emisión fiscal con ARCA/AFIP queda fuera de alcance en esta versión (ADR-0010).
- Precios en pesos argentinos, IVA único y precio neto (ADR-0001, ADR-0013).

## Brand Commitments

- Nombre: Chiga Tech. Voz en español rioplatense con voseo, sin jerga ni siglas.

## Evidence on Hand

- Login construido (`frontend/src/features/auth/`) y tokens en `frontend/src/index.css`.
- Vistas de Productos y Clientes diseñadas en el canvas "CHIGA TECH - Vistas" (claude.ai).
- No hay clientes, métricas ni testimonios reales cargados: no se inventan.

## Product Principles

1. Se entiende leyendo, sin probar.
2. Lo necesario para decidir está a la vista en la misma pantalla.
3. La venta es la tarea que manda: nada la demora ni la interrumpe.
4. Cada rol ve solo lo que puede hacer.

## Accessibility & Inclusion

Pensado para personas mayores y con conocimientos informáticos básicos: tipografía para baja visión, texto base de 16px, contraste AA, objetivos de 44px y uso completo con teclado (RNF-03, RNF-04, RNF-14, RNF-15).
