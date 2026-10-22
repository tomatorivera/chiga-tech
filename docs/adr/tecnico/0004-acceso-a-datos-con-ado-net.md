---
status: accepted
---

# El backend accede a la BD con ADO.NET y Npgsql, sin ORM

La API se conecta a PostgreSQL con Npgsql, el proveedor de ADO.NET, y escribe el SQL a mano. Hay un único `NpgsqlDataSource` registrado como singleton en el contenedor de dependencias; los repositorios le piden conexiones y comandos. Se eligió así porque el equipo ya escribe SQL (esquema, triggers y funciones en `db/migrations`, [ADR técnico 0002](0002-esquema-de-bd-con-flyway.md)) y nadie usó EF Core ni Dapper, así que no hay que aprender una herramienta más. Además, el esquema vive en Flyway: un ORM solo sumaría un segundo modelo para mantener sincronizado con las tablas.

## Considered Options

- **EF Core**: descartada. Nadie del equipo lo usa, y con el esquema en Flyway las entidades y el `DbContext` serían una copia de las tablas que hay que mantener a mano.
- **Dapper**: descartada por ahora. Ahorra el mapeo de filas a objetos, pero es una dependencia más para algo que con ADO.NET son unas pocas líneas por consulta.

## Consequences

- Npgsql es la única dependencia de acceso a datos. No se agrega EF Core ni Dapper sin un ADR nuevo.
- La cadena de conexión sale de `ConnectionStrings:Default`. En desarrollo, `appsettings.Development.json` trae los valores de `docker-compose.yml`; en cualquier entorno se sobreescribe con la variable `ConnectionStrings__Default`. Fuera de Development no hay valor por defecto.
- Los tests de integración usan la BD real, así que necesitan que esté levantada y con migraciones (`npm run db:reset`).
- El mapeo de filas a objetos y el manejo de `NULL` se escriben a mano en cada repositorio.
