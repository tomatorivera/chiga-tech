# Chiga Tech

Proyecto final de Programador Universitario y Licenciatura Informática: sistema de punto de venta para una casa de computación.

**Stack:** ASP.NET Core (.NET 10) · React + TypeScript (Vite, Tailwind) · PostgreSQL + Flyway. Monorepo.

## Recorrido

Leé en este orden; cada documento enlaza al siguiente.

1. **Este README**: instalar y levantar el proyecto.
2. [Base de datos](db/README.md): migraciones, seeds y [casos de uso](db/casos-de-uso.md).
3. [Backend](backend/README.md)
4. [Frontend](frontend/README.md)
5. [Flujo de trabajo](docs/GIT.md): ramas, commits, issues y PRs.

## Requisitos

- [Git](https://git-scm.com/)
- [Node.js 24](https://nodejs.org/)
- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), corriendo

## Onboarding del repositorio

La primera vez que lo clones (o que recibas estos cambios), desde la raíz:

```bash
npm install                    # dependencias de la raíz y git hooks
npm --prefix frontend install  # dependencias del frontend
npm run db:up                  # BD + migraciones
npm run db:seed                # datos de prueba
```

No hace falta `.env`: los valores por defecto funcionan ([cómo cambiarlos](db/README.md#conexión)).

### Levantar el proyecto

| Qué | Comando | Desde | URL |
|---|---|---|---|
| BD | `npm run db:up` | raíz | `localhost:5432` |
| Backend | `dotnet watch` | `backend/Chiga.Api` | http://localhost:5098 |
| Frontend | `npm run dev` | `frontend` | http://localhost:5173 |

### Tests

Desde la raíz:

| Comando | Qué corre |
|---|---|
| `npm test` | Todo |
| `npm run test:unit` | Unitarios de backend y frontend |
| `npm run test:unit:backend` / `test:unit:frontend` | Unitarios de una parte |
| `npm run test:integration` | Integración del backend |

### Carpetas

```
.
├── .github/          # CI y plantillas de issues y PRs
├── .husky/           # Git hooks
├── backend/          # API (.NET) y sus tests
├── db/               # Migraciones y seeds
├── docs/             # Requisitos, glosario, ADR, diseño y flujo de trabajo
├── frontend/         # App web (React)
├── docker-compose.yml
└── package.json      # Scripts de BD y tests
```

## Referencia

Se consultan cuando hacen falta, no son parte del recorrido.

- [ERS](docs/ERS.md): requisitos del sistema.
- [CONTEXT](docs/CONTEXT.md): glosario del dominio. Usá estos términos en código, issues y PRs.
- [ADR de negocio](docs/adr/negocio/) y [técnicos](docs/adr/tecnico/): decisiones tomadas y por qué.
- [Contratos de api](docs/contracts/): docs de los endpoints antes inicializar una feature, nos brinda un punto de inicio y fin en común para que front y back trabajen en paralelo. Una vez se implementa se puede ir ampliando y todo debería quedar documentado en Swagger.
- [Diagrama de la BD](docs/disenio/base-de-datos.mmd) (Mermaid): se actualiza con IA a partir de las migraciones y se lo usa para presentar en clases.

---

[**Siguiente ->**](db/README.md) (base de datos)
