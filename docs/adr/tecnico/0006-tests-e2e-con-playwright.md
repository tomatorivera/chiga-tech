---
status: accepted
---

# Tests e2e con Playwright

Los flujos que atraviesan frontend, backend y BD (login, sesión, logout) no los cubren los tests unitarios ni los de integración por separado. Se prueban con Playwright en `frontend/e2e/`, con Chromium como único navegador. Solo van acá los flujos críticos que integran las tres partes; lo chico se prueba en unitarios o integración.

Necesitan la BD levantada con migraciones y seeds (`npm run db:up` y `npm run db:seed`). `playwright.config.ts` arranca el backend y el frontend si no están corriendo.

Las aserciones no dependen de textos de la interfaz ni del store de zustand: validan la URL, las cookies del contexto, el status de las respuestas de red y la presencia de roles o labels accesibles. Así un cambio de copy no rompe los tests.

## Considered Options

- **Correrlos en todas las PRs**: descartada por el costo de CI (BD, compilación del backend y navegador). Corren solo en PRs a `main`.

## Consequences

- El job `e2e` del CI corre únicamente en PRs a `main` y sube el reporte como artifact si falla.
- Localmente hay que tener la BD con seeds; los tests usan los usuarios de `db/seeds/03_usuarios.sql`.
- Los tests reutilizan los servidores que ya estén corriendo fuera del CI.
