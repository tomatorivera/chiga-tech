---
status: proposal
---

# El esquema de la BD se versiona con migraciones SQL de Flyway, no con EF Core

La BD es PostgreSQL y en desarrollo corre en Docker. El esquema se escribe en archivos SQL dentro de `db/migrations`, y Flyway los aplica en orden y registra cuáles corrió. Se eligió así porque el equipo planea usar triggers y funciones, que se escriben naturalmente en SQL, y porque nadie en el grupo usó EF Core: sus migraciones agregan un snapshot del modelo que genera conflictos de merge difíciles de entender cuando dos personas cambian el esquema en paralelo.

## Considered Options

- **Migraciones de EF Core**: descartada. Los triggers y funciones quedan como strings de SQL dentro de C#, cada cambio a una función es una migración nueva con la función entera, y aplicar el esquema depende de tener el SDK de .NET.
- **DbUp**: descartada. Es la misma idea que Flyway, pero corre dentro de la API, así que hay que levantar el backend para tener la BD actualizada.
- **Postgres instalado en cada máquina**: descartada como norma. Cada integrante tendría que manejar a mano la versión, el usuario y el reseteo; queda como plan B para quien no pueda usar Docker.

## Consequences

- Si se usa EF Core en el backend, es solo como ORM, sin sus migraciones: las entidades se mapean a las tablas que crea Flyway.
- Los cambios hechos a mano en la BD (desde pgAdmin, por ejemplo) no se propagan: todo cambio de esquema tiene que terminar en un archivo de `db/migrations`.
- Los datos que el sistema necesita en cualquier entorno (configuración, roles, Consumidor Final) van en migraciones; los datos de prueba, en `db/seeds`.
