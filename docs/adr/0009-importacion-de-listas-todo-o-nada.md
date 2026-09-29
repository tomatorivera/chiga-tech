# Las listas de proveedores se aplican completas, tras resolver sus incidencias

Una lista de precios de proveedor solo actualiza precios (nunca stock) y se aplica completa o no se aplica (RNF-07). Las filas se vinculan con productos únicamente por código de barras. Las filas cuyo código no existe son incidencias que el usuario resuelve antes de aplicar: vincularlas a un producto existente (el código se agrega como código de barras adicional) o dar de alta un producto nuevo completando sus datos. La aplicación final crea productos, agrega códigos y actualiza precios en una sola transacción, revalidando todo en el servidor.

## Considered Options

- **Aplicar las filas que coinciden y dejar las demás para después**: descartada; deja la lista aplicada a medias.
- **Tablas de importación y de formato en la base de datos**: descartada por simplicidad; el borrador de una importación en curso se guarda en el localStorage del navegador y el formato de lista de cada proveedor, en memoria del servidor.
- **Vincular por código del proveedor**: descartada para esta versión; requería una tabla producto–proveedor.

## Consequences

- Un borrador solo existe en el navegador donde se empezó; si en el servidor algo cambió mientras tanto (p. ej. otro usuario dio de alta ese código de barras), la aplicación se rechaza con el detalle y se vuelve a la resolución.
- El formato de lista se pierde al reiniciar el servidor y debe volver a definirse al importar.
- Las listas se importan solo en ARS (ver ADR 0001).
- Qué costos y precios actualiza exactamente la importación (regla de margen) queda pendiente de consulta con el docente.
