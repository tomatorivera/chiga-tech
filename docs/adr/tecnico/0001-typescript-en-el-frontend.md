---
status: accepted
---

# El frontend usa TypeScript con los tipos de la API escritos a mano

El frontend (React) se escribe en TypeScript aunque solo uno de los tres integrantes lo maneja. El frontend consume una API con muchas entidades, estados y campos opcionales (ver apéndice A del ERS), y en JavaScript un nombre de campo mal escrito o un DTO que cambia en el backend no da error: la pantalla muestra `undefined` y el problema aparece recién al usarla. Para que el costo de aprendizaje sea bajo, las reglas lint implementadas para TypeScript no serán tan estrictas, incluso permitirán el uso de _any_ como último recurso, que sigue siendo mejor que un dato no tipado en javascript vanilla. Además, los tipos de datos se crearán igual que los del backend en C#.

El equipo ya programa en C#, así que el tipado fuerte no es un concepto nuevo.

## Considered Options

- **JavaScript sin tipos**: descartada. Los errores de nombres y de cambios en los DTOs son silenciosos, y migrar a TypeScript con el proyecto avanzado es mucho más caro que empezar con él.
- **JavaScript con JSDoc y `checkJs`**: descartada. Hay que escribir los mismos tipos con una sintaxis más incómoda y con menos documentación.

## Consequences

- Los errores de tipos no bloquean el servidor de desarrollo, porque el "compilador" (Vite) no verificará tipos. Se verifican en el IDE y en el build.
- `any` está permitido como salida de emergencia. La regla de lint lo marca como advertencia, no como error.
- Cada tipo del frontend replica un DTO del backend, incluida su nulabilidad: una propiedad nullable en C# (`string?`) es `string | null` en TypeScript.
- Los enums se serializan como texto (`JsonStringEnumConverter`) y en el frontend se tipan como uniones de strings (`"Pendiente" | "Confirmada" | "Rechazada"`). Si se serializan como números, llegan al frontend sin nombre.
- Cuando cambia un DTO en el backend, hay que actualizar a mano su tipo en el frontend en el mismo cambio. Nada detecta si quedan desincronizados: TypeScript solo verifica que el frontend sea coherente con sus propios tipos, no con lo que realmente devuelve la API.
- Los importes `decimal` de C# llegan como `number` de JavaScript. Los tipos no resuelven la precisión decimal (RNF-10): los cálculos con dinero se hacen en el backend.
