---
status: accepted
---

# El backend accede a la BD con ADO.NET y SQL escrito a mano, sin ORM

Los repositorios del backend abren conexiones y ejecutan consultas SQL con ADO.NET, mediante Npgsql (el proveedor de ADO.NET para PostgreSQL), y leen los resultados a mano para armar los objetos. Se eligió así porque nadie en el grupo usó EF Core ni Dapper, pero todos escribimos SQL a mano en las materias de la facultad, así que es la opción que menos frena el desarrollo. Por otro lado, el esquema de la BD ya se maneja desde el repo con Docker y las migraciones de Flyway (ADR técnico 0002): no hace falta un ORM que lo modele ni migraciones de EF Core.

## Considered Options

- **EF Core como ORM, sin sus migraciones**: descartada. Hay que aprender el mapeo de entidades, el seguimiento de cambios y cómo se traduce LINQ a SQL, y mantener las entidades sincronizadas a mano con las tablas que crea Flyway.
- **Dapper sobre Npgsql**: descartada. Ahorra el mapeo de columnas a propiedades, pero es una dependencia y una API más para aprender, y la ganancia es chica con las pocas consultas que se estima que tendrá cada repositorio.

## Consequences

- Npgsql es la única dependencia de acceso a datos. La conexión se configura una vez, con un `NpgsqlDataSource` registrado en el contenedor de dependencias, y la cadena de conexión se lee de la configuración.
- Las consultas usan siempre parámetros (`@nombre`), nunca concatenación de strings, para evitar inyección SQL.
- El mapeo de columnas a propiedades se escribe a mano en cada repositorio. Si una columna cambia en una migración, el compilador no lo detecta: lo detectan los tests de integración, que corren contra la BD de Docker.
- Las operaciones que tocan varias tablas abren una transacción explícita (`NpgsqlTransaction`).
- Si más adelante el mapeo manual se vuelve repetitivo, se puede sumar Dapper sin cambiar el modelo: trabaja sobre las mismas conexiones de ADO.NET.
