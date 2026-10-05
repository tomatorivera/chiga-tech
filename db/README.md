# Sobre este documento

Este documento explica la tecnología usada para manejar la BD, qué son las migraciones, las seeds, los esquemas y consideraciones. Si querés settear la BD o leer sobre cómo hacer algo en particular, leé el [archivo de casos de uso](casos-de-uso.md).

# Base de datos local

Usamos PostgreSQL en Docker, con el esquema versionado en `migrations/` y aplicado por [Flyway](#sobre-flyway). Solo hace falta tener Docker instalado y corriendo (ver [ADR técnico 0002](../docs/adr/tecnico/0002-esquema-de-bd-con-flyway.md)).

## Comandos

Se corren desde la raíz del repo, son comandos de **npm** creados como capa de abstracción por sobre docker:

| Comando | Qué hace |
|---|---|
| `npm run db:up` | Levanta Postgres y aplica las migraciones pendientes |
| `npm run db:seed` | Carga los datos de prueba de `seeds/` (se puede repetir sin duplicar) |
| `npm run db:reset` | Borra la BD, la recrea desde las migraciones y carga los seeds |
| `npm run db:migrate` | Aplica migraciones pendientes (después de un `git pull`) |
| `npm run db:info` | Lista las migraciones y cuáles están aplicadas |
| `npm run db:psql` | Abre una consola SQL |
| `npm run db:gui` | Abre pgAdmin en http://localhost:5050 |
| `npm run db:down` | Apaga los contenedores sin borrar los datos |

## Conexión

Datos de la conexión por defecto: 

- URL: `localhost:5432`
- Nombre de la BD: `chiga`
- Usuario `chiga`
- Contraseña `chiga`. 

Para cambiar algún valor, por ejemplo el puerto si ya tenés otro Postgres usando el 5432, copiá `.env.example` a `.env` en la raíz.

En pgAdmin el servidor "chiga (local)" ya aparece configurado; la primera vez pide la contraseña (`chiga`) y se puede marcar "Save password". También se puede usar DBeaver o la extensión de Postgres de VS Code con los datos de conexión de arriba.

## Migraciones

Dentro de `db/migrations` hay scripts SQL que levantan la BD y crean toda su estructura, dentro de estos archivos hacemos cambios persistentes en la base de datos (agregar tablas, columnas, cambiar primary/foreign keys, crear vistas, triggers, funciones...). Flyway maneja el versionado de estos archiivos, pero **Flyway no detecta cambios hechos a mano en la BD**: solo aplica los archivos de `migrations/`. Por ejemplo, un trigger que creaste desde pgAdmin existe solo en tu máquina.

### Cambios de esquema

Para cambiar algo en la BD, este es el proceso:

1. Probá el cambio en pgAdmin o `db:psql`.
2. Cuando funcione, pasá el SQL a un archivo nuevo en `migrations/` (mirá la sección siguiente _"Tipos de archivo"_ antes de crearlo).
3. Corré `npm run db:reset` para confirmar que la BD se arma desde cero solo con los archivos.
4. Commiteá el archivo. El resto del equipo lo recibe con `git pull` + `npm run db:migrate`.

### Tipos de archivo

Flyway reconoce la función de los archivos según su nombre, no es solo una convención sino que es obligatorio. Los tipos de archivos son:

- **Versionado**, `V003__descripcion.sql`: corre una sola vez. Para tablas, columnas, índices y datos que el sistema necesita en todos los entornos. **Nunca se edita una vez commiteado**: Flyway compara un checksum y falla si cambió. Para corregir algo, se crea el siguiente `VXXX__`.
- **Repetible**, `R__descripcion.sql`: se vuelve a aplicar cada vez que cambia su contenido. Para funciones, triggers y vistas, escritos con `CREATE OR REPLACE`. Se edita el mismo archivo.

Dos cosas importantes:

1. Los nombres llevan **dos** guiones bajos entre el número y la descripción. Si dos personas crean el mismo número de versión en ramas paralelas, la segunda en mergear renumera la suya.
2. Si todavía no commiteaste el archivo versionado *VXXX__* podes seguir modificándolo.

## Seeds

`seeds/` son scripts que agregan a la BD datos de prueba. No se usan en producción. Cosas a tener en cuenta:

1. Los scripts evitan ingresar datos duplicados, si modificas uno que ya habías agregado, se ignora. Para agregarlos de nuevo usa el comando `npm run db:reset` antes.
2. A diferencia de los archivos versionados, los seeds no tienen verificación por commit asi que podés cambiarlos cuando quieras.
3. Si cambiás una seed y lo pusheas, ese cambio aplica para todos los demás que hagamos pull después.

# Anexos

## Sobre flyway

Documentación oficial: https://documentation.red-gate.com/fd

Flyway es nuestro gestor de migraciones de la BD. Para no tener que estar mandándonos la BD exportada, importarla, volverla a exportar, los scripts SQL hechos a mano, y recreando datos de prueba, usamos esta herramienta que nos permite tener todo lo anterior centralizado en scripts dentro del repo (`db/`). De este modo, todas las actualizaciones que se hagan sobre la BD quedan en el repo, otra persona hace pull y levanta la base de datos actualizada con un solo comando.