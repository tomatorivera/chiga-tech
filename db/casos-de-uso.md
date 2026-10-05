# Sobre este documento

Este documento detalla cómo llevar a cabo acciones precisas sobre la BD. Cualquier duda que no esté, se agrega acá, cualquier cosa que no esté clara, se corrige, cualquier flujo que se agregue, se lo documenta.

# Casos de uso

## 01. Setup de la BD

Clonaste el repo en tu PC o en otra, tenés *Docker* y *npm* instalado en tu máquina, y querés levantar la base de datos por primera vez:

1. `npm run db:up` -> levanta solo la BD, con los datos de conexión [por defecto](README.md#conexión)*
2. `npm run db:gui` -> levanta la GUI de pgAdmin en el navegador: http://localhost:5050
3. (Opcional) `npm run db:seed` -> carga datos de prueba a la BD

## 02. Cambiar datos de la conexión a la BD

Tenes algún problema con las credenciales iniciales y necesitas modificarlas:

1. Creas un archivo llamado **.env** en la raíz del repositorio
2. Copiás los datos de **.env.example** a tu **.env**
3. Modificas cualquier credencial o puerto que desees
4. `npm run db:up` -> levanta la BD con los datos que pusiste

## 03. Actualizar la BD a un estado avanzado respecto del tuyo

Te moviste a la rama de alguien, o alguien mergeó algo nuevo en la rama *dev*, y ves que agregó migraciones:

1. `npm run db:migrate` -> ejecuta SOLO las nuevas migraciones
2. (Opcional) `npm run db:seed` -> si agregaron nuevos datos de prueba

## 04. La BD se rompió o querés devolverla a un estado anterior

Te moviste a la rama de alguien y ves que no actualizó la BD al último estado en que la tenías vos, o saltaste entre ramas ejecutando resets y crees que tu BD quedó rota o rara:

1. `npm run db:reset` -> borra toda tu BD y la reconstruye de nuevo

## 05. Solucionar migraciones con el mismo número al hacer PR

Abriste una PR hacia `dev` y ves que en la sección de "checks" falla el flujo `database`, con el error: `Found more than one migration with version 00X`, el problema es que alguien mergeó a `dev` una nueva migración y tiene el mismo código que la tuya pero distinto nombre:

1. `git merge dev` (o el nombre de la rama contra la que abras la PR) -> traés los cambios nuevos de la otra rama
2. Renombrás **tu** archivo al siguiente número libre, por ejemplo `V003__mi_cambio.sql` pasa a `V004__mi_cambio.sql`.
3. `npm run db:reset` -> reconstruye la BD con todas las migraciones en el orden nuevo
4. Corrés tus tests y te fijás que no se haya cambiado ni roto nada más
5. Pusheás y esperás que el CI (los checks) quede en verde

## 06. Agregar o modificar el esquema (tablas, columnas, índices, foreign keys, primary keys)

Necesitás una tabla nueva, una columna más, un índice o un cambio de datos que el sistema necesita en todos los entornos:

1. Probá el SQL en pgAdmin (`npm run db:gui`) o en la consola (`npm run db:psql`)
2. Cuando funcione, pasalo a un archivo nuevo `db/migrations/V00X__descripcion.sql`, donde `X` es el siguiente número libre (miralos en la carpeta; dos guiones bajos antes de la descripción)
3. `npm run db:reset` -> confirma que la BD se arma desde cero solo con los archivos, sin tus cambios manuales
4. Si el cambio toca tablas o columnas que usan los seeds, ajustalos en el mismo commit; si no, `db:seed` va a fallar para todos
5. (Opcional) Actualizá el diagrama `docs/disenio/base-de-datos.mmd` (o después pedile a una IA que lo haga basándose en la estructura de las migraciones)
6. Commiteá todo junto

Una migración versionada **nunca se edita una vez commiteada**: si hay que corregir algo, se crea otra migración.

## 07. Agregar o modificar un trigger, función o vista

Querés crear o cambiar lógica que vive en la BD:

1. Probala en pgAdmin o en `db:psql`
2. Pasala a un archivo `db/migrations/R__nombre_descriptivo.sql`, escrito con `CREATE OR REPLACE` (función, vista o trigger). Un archivo por objeto
3. `npm run db:reset` -> confirma que funciona desde cero
4. Commiteá. Si más adelante hay que cambiarla, **se edita el mismo archivo**: Flyway lo vuelve a aplicar solo porque cambió su contenido

Cosas a tener en cuenta:

- Los `R__` corren **después** de todas las migraciones versionadas, así que pueden usar cualquier tabla. Entre ellos se ordenan alfabéticamente por nombre: si un trigger usa una función de otro archivo, el nombre del archivo de la función tiene que ir antes.
- Si cambiás o quitás una **columna de una vista**, `CREATE OR REPLACE` falla con `cannot change name of view column`. En ese caso poné `DROP VIEW IF EXISTS nombre_vista;` en la primera línea del archivo. Si otra vista depende de esta, el `DROP` también falla y hay que borrar o rehacer ambas en el orden correcto.

## 08. Error `checksum mismatch`

Corrés cualquier comando de BD y aparece algo como:

```
Migration checksum mismatch for migration version 003
-> Applied to database : -2089685388
-> Resolved locally    : 1772759356
```

Significa que un archivo `V` que tu BD ya aplicó es distinto al que tenés ahora. Cuenta cualquier cambio, incluso un comentario o un espacio. Pasa si editaste una migración ya aplicada, o si cambiaste a una rama que tiene otra versión del archivo.

- **Si el archivo todavía no está commiteado** (es tuyo y lo estás desarrollando): `npm run db:reset`.
- **Si ya está commiteado o mergeado**: revertí el archivo a su versión original (`git checkout dev -- db/migrations/V00X__nombre.sql`) y hacé el cambio en una migración nueva (caso 06).
- Si el cambio fue realmente cosmético (espacios, comentarios...) y querés conservarlo, existe `docker compose run --rm flyway repair`, que actualiza los checksums guardados. Pero **cada integrante tiene que correrlo en su BD**, así que hablalo con el equipo antes.

## 09. Retomar el trabajo después de reiniciar la PC

Prendiste la PC y la BD no está corriendo, o apagaste todo con `db:down`:

1. Abrí *Docker Desktop* y esperá a que diga *Engine running*
2. `npm run db:up` -> tus datos siguen ahí, porque viven en un volumen que `db:down` no borra, y de paso aplica las migraciones pendientes
3. (Opcional) `npm run db:gui` -> pgAdmin no se levanta con `db:up`

Correr `db:up` con todo ya levantado es seguro: no reinicia nada ni borra datos.

## 10. Falla el job `database` del CI en mi PR

El check `database` aparece en rojo en tu PR:

1. Entrá a la pestaña *Checks* de la PR, abrí el job `database` y mirá en qué paso falló (`migrate`, `validate` o `seed`).
2. Reproducilo en tu máquina: `git merge dev` y `npm run db:reset`. Es el mismo recorrido que hace el CI, y vas a ver el mismo error en tu terminal
3. Corregí según el error:

| Error | Qué pasó | Qué hacer |
|---|---|---|
| `Found more than one migration with version 00X` | Alguien mergeó una migración con tu mismo número | Caso 05 |
| `Migration checksum mismatch` | Se editó una migración ya aplicada | Caso 08 |
| `ERROR: ...` de Postgres con un `Location` y una `Line` | Hay SQL inválido en esa migración | Corregir el archivo señalado |
| Falla en el paso `seed` | Un seed no coincide con el esquema | Ajustar el seed (caso 06, punto 4) |

4. Pusheá la corrección: el CI se vuelve a ejecutar solo
