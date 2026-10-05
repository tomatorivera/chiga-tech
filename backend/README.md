# Backend

API web de Chiga Tech en ASP.NET Core (.NET 10), con controllers y tests en xUnit.

Para el setup general del repo (requisitos, BD, flujo de trabajo) ver el [README de la raíz](../README.md).

## Proyectos

| Proyecto | Qué contiene |
|---|---|
| `Chiga.Api/` | La API: controllers, configuración (`appsettings*.json`) y arranque (`Program.cs`) |
| `Chiga.UnitTests/` | Tests unitarios: prueban clases aisladas, sin levantar la API ni la BD |
| `Chiga.IntegrationTests/` | Tests de integración: levantan la API en memoria y le hacen requests |
| `Chiga.slnx` | Solución que agrupa los tres proyectos (abrir este archivo en Visual Studio / Rider) |

## Comandos

| Comando | Desde | Qué hace |
|---|---|---|
| `dotnet watch` | `backend/Chiga.Api` | Levanta la API y la reinicia al guardar cambios |
| `dotnet run` | `backend/Chiga.Api` | Levanta la API sin recarga automática |
| `dotnet build Chiga.slnx` | `backend/` | Compila todos los proyectos |
| `dotnet test` | Chiga.UnitTests | Corre los tests unitarios |
| `dotnet test` | Chiga.IntegrationTests | Corre los tests de integración |

La API queda en http://localhost:5098. En desarrollo, abrir esa URL redirige a **Swagger** (`/swagger`), donde se pueden ver y probar todos los endpoints. Para verificar que esté andando: `GET http://localhost:5098/ping` devuelve `pong`.

También se pueden probar requests desde el editor con [`Chiga.Api/api.http`](Chiga.Api/api.http) (soportado por Visual Studio con la extensión REST Client de VS Code).

## Convenciones

- **Controllers:** van en `Chiga.Api/Controllers/`, uno por recurso, heredando de `ControllerBase` con `[ApiController]`.
- **Tests:** replican la ruta del archivo que prueban (`Controllers/HealthController.cs` → `Chiga.UnitTests/Controllers/HealthControllerTests.cs`) y se nombran `Metodo_Resultado` (p. ej. `Ping_ReturnsOkWithPong`).
- **Importes:** se manejan como `decimal` y los cálculos con dinero se hacen acá, no en el frontend. Todos los importes están en centavos para evitar errores de redondeo.
- **Enums:** se serializan como texto, no como números, para que el frontend los reciba con nombre.
- **DTOs:** si cambiás uno, actualizá su tipo en el frontend en el mismo cambio. Ver el [ADR técnico 0001](../docs/adr/tecnico/0001-typescript-en-el-frontend.md).
- **Base de datos:** el esquema **no** se maneja desde el backend (no hay migraciones de EF Core); se cambia con scripts SQL en `db/migrations`. Ver [db/README.md](../db/README.md).
