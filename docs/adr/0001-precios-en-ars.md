# Todos los importes se manejan en pesos argentinos (ARS)

Precios, costos, comprobantes, cuenta corriente y listas de proveedores se expresan exclusivamente en ARS, aunque en una casa de tecnología argentina lo habitual es cotizar en USD. Manejar USD internamente obligaba a elegir una fuente de cotización (API externa con cron o carga manual del administrador), a congelar la cotización en cada venta y a definir en qué moneda queda la deuda de cuenta corriente; esa complejidad no entra en el alcance del proyecto (3 meses, 3 desarrolladores) y agregaba una dependencia externa frágil para la demo.

## Consequences

- Ante una devaluación los precios deben actualizarse vía listas de proveedores o edición manual; el sistema no reprecia solo.
- Las listas de proveedores en USD se convierten a ARS fuera del sistema antes de importarlas.
- Si en el futuro se incorpora USD, habrá que agregar moneda y cotización a producto, venta/ítem y comprobante.
