# Base de datos

PostgreSQL en Docker. El esquema vive en `migrations/` y lo aplica [Flyway](https://documentation.red-gate.com/fd) ([por qué](../docs/adr/tecnico/0002-esquema-de-bd-con-flyway.md)): nadie se pasa backups, cada uno hace `pull` y reconstruye la BD con un comando.

Para tareas concretas (setup, errores, cambios de esquema) andá a los [casos de uso](casos-de-uso.md).

## Comandos

Desde la raíz:

| Comando | Qué hace |
|---|---|
| `npm run db:up` | Levanta Postgres y aplica migraciones pendientes |
| `npm run db:migrate` | Aplica migraciones pendientes (después de un `pull`) |
| `npm run db:seed` | Carga los datos de prueba (no duplica) |
| `npm run db:reset` | Borra la BD y la recrea con migraciones y seeds |
| `npm run db:info` | Lista migraciones y cuáles están aplicadas |
| `npm run db:psql` | Consola SQL |
| `npm run db:gui` | pgAdmin en http://localhost:5050 |
| `npm run db:down` | Apaga los contenedores sin borrar datos |

## Conexión

`localhost:5432`, base `chiga`, usuario `chiga`, contraseña `chiga`.

- **Cambiar valores** (p. ej. el puerto está ocupado): copiá `.env.example` a `.env` en la raíz y editalo.
- **pgAdmin:** el servidor "chiga (local)" ya está cargado; la primera vez pide la contraseña.
- También sirven DBeaver o la extensión de Postgres de VS Code.

## Migraciones

Todo cambio de estructura (tablas, columnas, claves, vistas, triggers, funciones) va en un archivo de `migrations/`. **Lo que cambies a mano en la BD existe solo en tu máquina.**

El nombre del archivo define su tipo (Flyway lo exige):

| Tipo | Nombre | Para | Se edita |
|---|---|---|---|
| Versionado | `V003__descripcion.sql` | Tablas, columnas, índices, datos fijos | **Nunca** después de commitear: se crea el siguiente `V` |
| Repetible | `R__descripcion.sql` | Funciones, triggers, vistas (`CREATE OR REPLACE`) | Sí, el mismo archivo; se reaplica al cambiar |

- Van **dos** guiones bajos antes de la descripción.
- Un `V` sin commitear se puede seguir editando.
- Si dos ramas usan el mismo número, renumera quien mergea segundo ([caso 05](casos-de-uso.md#05-solucionar-migraciones-con-el-mismo-número-al-hacer-pr)).

Pasos para cambiar el esquema: [caso 06](casos-de-uso.md#06-agregar-o-modificar-el-esquema-tablas-columnas-índices-foreign-keys-primary-keys) (tablas) o [caso 07](casos-de-uso.md#07-agregar-o-modificar-un-trigger-función-o-vista) (lógica).

## Seeds

`seeds/` carga datos de prueba; no se usa en producción.

- No duplican: si editás un seed ya cargado, corré `npm run db:reset` para verlo.
- Se pueden editar libremente; el cambio le llega a todos con el `pull`.

---

[**<- Anterior**](../README.md) (README) -- [**Siguiente ->**](../backend/README.md) (backend)
