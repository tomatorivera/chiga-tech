# Backend

API en ASP.NET Core (.NET 10), tests con xUnit. Abrí `Chiga.slnx` en Visual Studio o Rider.

| Proyecto | Contiene |
|---|---|
| `Chiga.Api/` | La API: controllers, `appsettings*.json` y `Program.cs` |
| `Chiga.UnitTests/` | Tests de clases aisladas, sin API ni BD |
| `Chiga.IntegrationTests/` | Tests que levantan la API en memoria y le hacen requests |

## Comandos

| Comando | Desde | Qué hace |
|---|---|---|
| `dotnet watch` | `Chiga.Api` | Levanta la API y la reinicia al guardar |
| `dotnet build Chiga.slnx` | `backend` | Compila todo |
| `dotnet test` | `Chiga.UnitTests` o `Chiga.IntegrationTests` | Corre esos tests |

La API queda en http://localhost:5098, que redirige a **Swagger** para ver y probar endpoints. `GET /ping` → `pong` confirma que anda. También podés usar [`api.http`](Chiga.Api/api.http) desde Visual Studio, Rider o VS Code (extensión REST Client).

## Convenciones

- **Controllers:** en `Chiga.Api/Controllers/`, uno por recurso, `ControllerBase` + `[ApiController]`.
- **Tests:** misma ruta que el archivo probado (`Controllers/HealthController.cs` → `Chiga.UnitTests/Controllers/HealthControllerTests.cs`); nombre `Metodo_Resultado`.
- **Dinero:** `decimal`, en centavos; los cálculos se hacen acá, no en el frontend.
- **Enums:** se serializan como texto.
- **DTOs:** si cambiás uno, actualizá su tipo en el frontend en el mismo cambio ([ADR técnico 0001](../docs/adr/tecnico/0001-typescript-en-el-frontend.md)).
- **Esquema de BD:** no se toca desde acá (no hay migraciones de EF Core); va en [`db/migrations`](../db/README.md#migraciones).

---

[**<- Anterior**](../db/README.md) (base de datos) -- [**Siguiente ->**](../frontend/README.md) (frontend)
