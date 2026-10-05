# Chiga Tech

Proyecto final de Programador Universitario y Licenciatura Informática. _Chiga Tech_ es un sistema tipo punto de venta para una casa de computación.

**Stack:** backend en ASP.NET Core (.NET 10), frontend en React + TypeScript (Vite, Tailwind) y base de datos PostgreSQL con migraciones de Flyway, todo en un monorepo.

## Onboarding

### Requisitos

- [Git](https://git-scm.com/)
- [Node.js 24](https://nodejs.org/) (con npm)
- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo

### Primera vez en el repositorio

Desde la raíz del repo:

```bash
# 1. Dependencias de la raíz
npm install

# 2. Dependencias del frontend
npm --prefix frontend install

# 3. Base de datos: levanta Postgres, aplica las migraciones y carga los datos de prueba
npm run db:up
npm run db:seed
```

No hace falta crear un `.env` para los datos de la BD: los valores por defecto funcionan. Solo si necesitás cambiar algo (por ejemplo, el puerto de Postgres) copiá `.env.example` a `.env`. Más detalle en [db/README.md](db/README.md#conexión).

### Levantar el proyecto

| Qué | Comando | URL |
|---|---|---|
| Base de datos | `npm run db:up` | `localhost:5432` |
| Backend | `cd backend/Chiga.Api & dotnet watch` | http://localhost:5098 (Swagger en `/swagger`) |
| Frontend | `cd frontend & npm run dev` | http://localhost:5173 |
| pgAdmin (opcional) | `npm run db:gui` | http://localhost:5050 |

### Tests

| Comando | Qué corre |
|---|---|
| `npm test` | Todos los tests (unitarios + integración) |
| `npm run test:unit` | Unitarios del backend y del frontend |
| `npm run test:unit:backend` | Unitarios del backend (`Chiga.UnitTests`) |
| `npm run test:unit:frontend` | Unitarios del frontend (Vitest) |
| `npm run test:integration` | Integración del backend (`Chiga.IntegrationTests`) |

### Flujo de trabajo

- Se trabaja en ramas que salen de `dev` y se integran mediante PRs hacia `dev`.
- Los commits siguen [Conventional Commits](https://www.conventionalcommits.org/es/) (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, etc.); commitlint rechaza el commit si no cumple el formato.
- La rama `main` es producción, y solo recibe PRs desde `dev`.

### Validaciones automáticas

El repo trabaja con herramientas que validan automáticamente posibles problemas, si ocurre alguno, detienen lo que estás haciendo y te informan:

1. **Husky**:
  - Al hacer commit, si trabajaste en el frontend valida el código que escribiste ahí
  - Al hacer commit, en el front o en el back, valida el formato del mensaje del commit
  - Al hacer push, corre los tests unitarios del frontend y/o backend según en qué trabajaste
2. **Github Actions**:
  - Al abrir una PR, el [CI](.github/workflows/ci.yml) verifica los commits, compila y testea el backend, aplica y valida las migraciones con los seeds, y corre lint, formato, tipos, tests y build del frontend. Si algo falla, te lo informa en la PR.

## Carpetas en este repositorio

```
.
├── .github/workflows/   # CI de GitHub Actions
├── .husky/              # Git hooks (commit-msg, pre-commit, pre-push)
├── backend/
│   ├── Chiga.Api/               # API web (ASP.NET Core)
│   ├── Chiga.UnitTests/         # Tests unitarios
│   ├── Chiga.IntegrationTests/  # Tests de integración
│   └── Chiga.slnx               # Solución .NET
├── db/
│   ├── migrations/      # Esquema de la BD versionado por Flyway
│   ├── seeds/           # Datos de prueba
│   ├── README.md        # Documentación sobre la BD y su manejo
│   └── casos-de-uso.md  # Acciones y problemas particulares sobre la BD
├── docs/
│   ├── adr/             # Registros de decisiones (negocio y técnicas)
│   ├── disenio/         # Diagramas de diseño
│   ├── CONTEXT.md       # Glosario del dominio
│   └── ERS.md           # Documento de requisitos
├── frontend/
│   └── src/features/    # Código del frontend organizado por funcionalidad
├── docker-compose.yml   # Configuración de docker: Postgres, Flyway, seeds y pgAdmin
└── package.json         # Scripts del repositorio (BD, tests) y hooks
```

## Índice de documentación

### Requisitos y dominio

- [Especificación de Requisitos de Software (ERS)](docs/ERS.md)
- [Glosario del dominio (CONTEXT)](docs/CONTEXT.md)
- [Diagrama de la base de datos](docs/disenio/base-de-datos.mmd) (Mermaid)

### Base de datos

- [Base de datos local](db/README.md): comandos, conexión, migraciones y seeds.
- [Casos de uso de la BD](db/casos-de-uso.md): setup, resetear la BD, conflictos de migraciones, errores comunes.
