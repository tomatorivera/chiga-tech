# Chiga Tech

Punto de venta para una casa de computación. Monorepo: `backend/` (ASP.NET Core, .NET 10), `frontend/` (React + TypeScript, Vite), `db/` (PostgreSQL + Flyway en Docker). Scripts en `package.json` de la raíz y de `frontend/`.

## Idioma y dominio

- Docs, commits, issues y PRs en español rioplatense (voseo).
- Código en inglés, salvo los términos del dominio, que van en español tal como aparecen en `docs/CONTEXT.md`: `ClienteDTO`, `CuentaCorrienteController`, `features/ventas/`, `useVentas`, `isLoading`, `handleSubmit`.
- Usá los términos de `docs/CONTEXT.md` y respetá los ADR de `docs/adr/` del área que tocás. Los requisitos están en `docs/ERS.md` (RF-XX, RNF-XX).

## Git

- Ramas `tipo/descripcion` creadas desde `dev`; PR hacia `dev`. `main` solo recibe PRs desde `dev`.
- Conventional Commits, alcance `frontend`, `backend` o `db`: `feat(backend): agregar alta de clientes`.
- Los hooks de husky (lint, commitlint, tests) son parte de la verificación: dejalos correr.
- Issues en GitHub con plantillas en `.github/ISSUE_TEMPLATE/`. Labels: `bug`, `enhancement`, `spec`, `ready-for-agent`, `ready-for-human`.

## Base de datos

- El esquema cambia solo con archivos SQL en `db/migrations/`. El backend no tiene migraciones de EF Core.
- `V00X__descripcion.sql` (dos guiones bajos) para estructura: un `V` commiteado es inmutable; las correcciones van en el siguiente número.
- `R__nombre.sql` con `CREATE OR REPLACE` para funciones, triggers y vistas: se edita el mismo archivo.
- Un cambio de esquema incluye en el mismo commit los ajustes a `db/seeds/` y a `docs/disenio/base-de-datos.mmd`.
- Verificá con `npm run db:reset`. Casos y errores comunes: `db/casos-de-uso.md`.

## Backend <-> frontend

- Los tipos de la API en el frontend replican a mano los DTOs del backend, con su nulabilidad (`string?` -> `string | null`). Cambiar un DTO implica actualizar su tipo en el frontend en el mismo cambio.
- Enums serializados como texto; en TS, uniones de strings.
- Los cálculos con dinero (`decimal`) se hacen en el backend.

## Backend

- Controllers en `Chiga.Api/Controllers/`, uno por recurso, `ControllerBase` + `[ApiController]`.
- Tests xUnit: misma ruta que el archivo probado dentro de `Chiga.UnitTests/` o `Chiga.IntegrationTests/`; nombre `Metodo_Resultado`.

## Frontend

- Código por funcionalidad en `src/features/<feature>/` (`components/`, `hooks/`, `models/`); lo compartido en `src/shared/`. Rutas en `src/routes.tsx`.
- Estilos con clases de Tailwind; íconos de `lucide-react`.
- Tests Vitest junto al archivo: `*.test.ts(x)`.
- Tipá todo explícitamente; `any` solo como último recurso.
- oxlint hace el lint general; ESLint solo reglas de seguridad.

## Verificación

Un cambio está terminado cuando pasan:

- Backend: `npm run test:unit:backend` y `npm run test:integration`.
- Frontend (desde `frontend/`): `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`.
- BD: `npm run db:reset`.

Si el cambio afecta algo documentado en un README o en `docs/GIT.md`, actualizalo en el mismo cambio.

## Agent skills

### Issue tracker

Issues y specs en GitHub Issues, vía `gh`. Ver `docs/agents/issue-tracker.md`.

### Domain docs

Contexto único: `docs/CONTEXT.md` y ADR en `docs/adr/negocio/` y `docs/adr/tecnico/`. Ver `docs/agents/domain.md`.

### Prioridad entre skills

- Los tests siguen siempre las convenciones de este archivo (xUnit y Vitest, en las rutas indicadas), aunque una skill proponga otro formato.
- En tareas de UI (diseño, estilos, layout, interacción) manda `impeccable`. `ponytail` aplica solo a la lógica: backend, BD, hooks, servicios y estado del frontend.
