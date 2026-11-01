# Chiga Tech

Punto de venta para una casa de computación. Monorepo: `backend/` (ASP.NET Core, .NET 10), `frontend/` (React + TypeScript, Vite), `db/` (PostgreSQL + Flyway en Docker). Scripts en `package.json` de la raíz y de `frontend/`.

## Idioma y dominio

- Docs, commits, issues y PRs en español rioplatense (voseo).
- Código en inglés. Los nombres de clases llevan los términos del dominio en español, tal como aparecen en `docs/CONTEXT.md`: `ClienteDTO`, `CuentaCorrienteController`. Los métodos y las variables pueden variar, pero preferentemente van en inglés: `getSessionUser`, `isLoading`, `handleSubmit`.
- Usá los términos de `docs/CONTEXT.md` y respetá los ADR de `docs/adr/` del área que tocás. Los requisitos están en `docs/ERS.md` (RF-XX, RNF-XX).

## Git

- Ramas `tipo/descripcion` creadas desde `dev`. Las PRs de una funcionalidad nueva van primero hacia `dev`; cuando está validada y terminada, pasa a `main` con una PR desde `dev`, la única rama de la que `main` recibe PRs.
- Se admiten PRs concatenadas: una rama con trabajo sobre otra funcionalidad todavía abierta sale de ella y abre su PR hacia ella, como `feat/auth-session-logout` sobre `feat/auth`. La rama base llega después a `dev`. Ver `docs/GIT.md`.
- Conventional Commits. El alcance es el módulo cuando el cambio se puede ubicar en uno (`auth`, `users`, `productos`, etc.): `feat(clientes): agregar alta de clientes`. `frontend`, `backend` y `db` quedan para cambios generales de esa parte, como agregar un esquema, configurar una dependencia del frontend o actualizar un middleware general del backend.
- Ningún commit que agregue lógica de negocio, conexión con una base de datos o integración entre frontend, backend y BD llega sin tests que evidencien que cumple su objetivo.
- Al abrir una PR, sugerile al usuario usar la skill `code-review` para revisar los estándares del código y, si hay ticket o spec, el cumplimiento de lo implementado. Después aplicá los cambios que consideres pertinentes; lo que decidas no modificar, por contexto, por un problema técnico o por un descubrimiento nuevo, queda escrito en la PR con su motivo.
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

- Código por funcionalidad en `src/features/<feature>/` (`components/`, `hooks/`, `models/`); las páginas que no pertenecen a ninguna feature, en `src/pages/`; lo compartido en `src/shared/`. Rutas en `src/routes.tsx`.
- Estilos con Tailwind CSS v4 siempre que sea posible. CSS propio solo si Tailwind no puede lograr lo buscado de ningún modo, si lo escribió el usuario o si pidió CSS explícitamente.
- Íconos de `lucide-react`.
- HTML5 con etiquetas semánticas siempre que se pueda y corresponda.
- Las páginas y los componentes nuevos se pueden usar con teclado y llevan etiquetas de accesibilidad.
- Tests Vitest junto al archivo: `*.test.ts(x)`.
- Tipá todo explícitamente; `any` solo como último recurso.
- oxlint hace el lint general; ESLint solo reglas de seguridad.

## Verificación

Un cambio está terminado cuando pasan:

- Backend: `npm run test:unit:backend` y `npm run test:integration`.
- Frontend (desde `frontend/`): `npm run lint`, `npm run format:check`, `npm run typecheck`, `npm test`.
- BD: `npm run db:reset`.

Si el cambio afecta algo documentado en un README, un ADR o `docs/GIT.md`, actualizalo en el mismo cambio.

## Documentación

- Los README orientan a quien llega a una carpeta del monorepo; evitá la documentación técnica en ellos.
- Las decisiones técnicas, los detalles de implementación y sus consecuencias van en el ADR que corresponda, o en uno nuevo si durante la implementación se tomó una decisión técnica sin documentar.

## Agent skills

### Issue tracker

Issues y specs en GitHub Issues, vía `gh`. Ver `docs/agents/issue-tracker.md`.

### Domain docs

Contexto único: `docs/CONTEXT.md` y ADR en `docs/adr/negocio/` y `docs/adr/tecnico/`. Ver `docs/agents/domain.md`.

### Prioridad entre skills

- Los tests siguen siempre las convenciones de este archivo (xUnit y Vitest, en las rutas indicadas), aunque una skill proponga otro formato.
- En tareas de UI (diseño, estilos, layout, interacción) manda `impeccable`. `ponytail` aplica solo a la lógica: backend, BD, hooks, servicios y estado del frontend.
- En tus implementaciones de lógica, aplicá `ponytail` (full, instalada en `.claude/skills/ponytail/`) siempre, sin esperar a que se lo pidan.
