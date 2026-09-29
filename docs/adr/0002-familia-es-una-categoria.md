# Una familia es una categoría sin padre (jerarquía de dos niveles)

Las familias ("Hardware") y las categorías ("CPUs", "GPUs") se guardan en la misma tabla `categoria`, con un `id_familia` que referencia a otra categoría. La jerarquía tiene como máximo dos niveles: una categoría con padre no puede ser padre de otra. Un producto puede colgar de una categoría o directamente de una familia (p. ej. "Servicios técnicos", sin subcategorías). Se eligió esto sobre dos tablas separadas porque evita duplicar ABM, filtros y búsquedas para dos conceptos casi idénticos.

## Consequences

- Para el reporte de más vendidos por familia (RF-48), la familia de un producto es la categoría padre de su categoría, o su propia categoría si esta no tiene padre.
- El límite de dos niveles lo valida la aplicación, no la base de datos.
