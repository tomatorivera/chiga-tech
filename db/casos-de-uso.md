# Casos de uso de la BD

Recetas para situaciones concretas. Si te falta una o algo no está claro, agregalo o corregilo acá.

## 01. Setup de la BD

Clonaste el repo en tu PC o en otra, tenés *Docker* y *npm* instalado en tu máquina, y querés levantar la base de datos por primera vez:

1. `npm run db:up`: levanta la BD con la [conexión por defecto](README.md#conexión).
2. `npm run db:seed` (opcional): datos de prueba.
3. `npm run db:gui` (opcional): pgAdmin en http://localhost:5050.

## 02. Cambiar datos de la conexión a la BD

Tenes algún problema con las credenciales iniciales y necesitas modificarlas:

1. Copiá `.env.example` a `.env` en la raíz.
2. Cambiá lo que necesites (usuario, contraseña, puertos).
3. `npm run db:up`.

## 03. Actualizar la BD a un estado avanzado respecto del tuyo

Te moviste a la rama de alguien, o alguien mergeó algo nuevo en la rama *dev*, y ves que agregó migraciones:

1. `npm run db:migrate`: aplica solo las nuevas.
2. `npm run db:seed` (opcional): si hay seeds nuevos.

## 04. La BD se rompió o querés devolverla a un estado anterior

Te moviste a la rama de alguien y ves que no actualizó la BD al último estado en que la tenías vos, o saltaste entre ramas ejecutando resets y crees que tu BD quedó rota o rara:

1. `npm run db:reset`: la borra y la reconstruye.

## 05. Solucionar migraciones con el mismo número al hacer PR

El check `database` de tu PR falla con `Found more than one migration with version 00X`: alguien mergeó a `dev` una migración con tu mismo número.

1. `git merge dev` (o la rama base de tu PR).
2. Renombrá **tu** archivo al siguiente número libre (`V003__mi_cambio.sql` → `V004__mi_cambio.sql`).
3. `npm run db:reset`.
4. Corré los tests.
5. Pusheá y esperá el CI en verde.

## 06. Agregar o modificar el esquema (tablas, columnas, índices, foreign keys, primary keys)

1. Probá el SQL en pgAdmin o `npm run db:psql`.
2. Pasalo a `db/migrations/V00X__descripcion.sql`, con `X` el siguiente número libre.
3. `npm run db:reset`: confirma que la BD se arma solo con los archivos.
4. Si el cambio afecta a los seeds, ajustalos en el mismo commit (si no, `db:seed` falla para todos).
5. (Opcional) Actualizá [el diagrama](../docs/disenio/base-de-datos.mmd); se puede generar con IA a partir de las migraciones.
6. Commiteá todo junto.

Para corregir una migración ya commiteada, se crea otra.

## 07. Agregar o modificar un trigger, función o vista

1. Probala en pgAdmin o `npm run db:psql`.
2. Pasala a `db/migrations/R__nombre.sql` con `CREATE OR REPLACE`. Un archivo por objeto.
3. `npm run db:reset`.
4. Commiteá. Para cambiarla después, **editá el mismo archivo**.

A tener en cuenta:

- Los `R__` corren después de todos los `V`, ordenados alfabéticamente: si un trigger usa una función de otro archivo, el de la función tiene que ir antes.
- Si cambiás o quitás una columna de una vista, `CREATE OR REPLACE` falla (`cannot change name of view column`). Agregá `DROP VIEW IF EXISTS nombre_vista;` al principio. Si otra vista depende de esta, hay que rehacer ambas en orden.

## 08. Error `checksum mismatch`

```
Migration checksum mismatch for migration version 003
-> Applied to database : -2089685388
-> Resolved locally    : 1772759356
```

Un `V` que tu BD ya aplicó cambió (aunque sea un espacio). Pasa al editar una migración aplicada o al cambiar a una rama con otra versión del archivo.

- **No commiteado** (lo estás escribiendo vos): `npm run db:reset`.
- **Commiteado o mergeado**: restauralo (`git checkout dev -- db/migrations/V00X__nombre.sql`) y hacé el cambio en una migración nueva ([caso 06](#06-agregar-o-modificar-el-esquema-tablas-columnas-índices-foreign-keys-primary-keys)).
- **Cambio cosmético que querés conservar**: `docker compose run --rm flyway repair` actualiza los checksums, pero cada integrante tiene que correrlo. Hablalo antes con el equipo.

## 09. Retomar el trabajo después de reiniciar la PC

1. Abrí Docker Desktop y esperá _Engine running_.
2. `npm run db:up`: los datos siguen ahí (`db:down` no los borra). Es seguro correrlo aunque ya esté levantada.
3. `npm run db:gui` (opcional): pgAdmin no arranca con `db:up`.

## 10. Falla el job `database` del CI en mi PR

El check `database` aparece en rojo en tu PR:

1. En la PR, abrí el check `database` y fijate en qué paso falló (`migrate`, `validate` o `seed`).
2. Reproducilo: `git merge dev` y `npm run db:reset` (es lo mismo que hace el CI).
3. Corregí según el error:

   | Error | Causa | Solución |
   |---|---|---|
   | `Found more than one migration with version 00X` | Número de migración repetido | [Caso 05](#05-solucionar-migraciones-con-el-mismo-número-al-hacer-pr) |
   | `Migration checksum mismatch` | Se editó una migración aplicada | [Caso 08](#08-error-checksum-mismatch) |
   | `ERROR: ...` de Postgres con `Location` y `Line` | SQL inválido | Corregir el archivo indicado |
   | Falla en `seed` | Un seed no coincide con el esquema | Ajustar el seed |

4. Pusheá: el CI se vuelve a correr solo.

---

[**<- Anterior**](README.md) (base de datos) -- [**Siguiente ->**](../backend/README.md) (backend)
