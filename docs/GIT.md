# Flujo de trabajo con Git y GitHub

Este documento explica cómo trabajamos con ramas, commits y pull requests (PR), paso a paso y con los comandos de cada etapa.

## Ramas

| Rama | Para qué | Quién escribe |
|---|---|---|
| `main` | Producción. Solo tiene versiones probadas | Solo recibe PRs desde `dev` |
| `dev` | Integración: acá se juntan los cambios de todos. Es la rama por defecto del repo | Recibe PRs desde las ramas de trabajo |
| `tipo/descripcion` | Rama de trabajo: una por tarea | Vos |

**Nunca se commitea directo a `dev` ni a `main`**: todo cambio entra por una PR.

Las ramas de trabajo se nombran con el mismo tipo que los commits y una descripción corta en minúsculas separada por guiones:

```
feat/login-page
fix/total-venta-con-descuento
docs/flujo-de-git
chore/actualizar-dependencias
```

## Ciclo de una tarea

### 1. Partir de `dev` actualizado

```bash
git switch dev
git pull
```

### 2. Crear la rama de trabajo

```bash
git switch -c feat/alta-de-clientes
```

### 3. Trabajar y commitear

```bash
git status                 # qué archivos cambiaron
git add <archivos>         # o `git add .` para agregar todo
git commit -m "feat(frontend): agregar formulario de alta de clientes"
```

Conviene hacer commits chicos y frecuentes, cada uno con un cambio que tenga sentido por sí solo.

Al commitear, si cambiaste algo en el frontend, husky corre automáticamente:

- **pre-commit**: lint y Prettier sobre los archivos del frontend que agregaste. Lo que se puede corregir solo se corrige; si queda algún error, el commit se cancela y te lo muestra.
- **commit-msg**: valida que el mensaje siga el formato de abajo. Si no, el commit se cancela.

En ambos casos el commit **no se hizo**: corregí lo que indica y volvé a correr `git commit`.

### 4. Subir la rama

La primera vez:

```bash
git push -u origin tipo/nombre-rama
```

Las siguientes veces, alcanza con `git push`.

Antes de subir, el hook **pre-push** corre los tests unitarios de la parte que tocaste (backend y/o frontend). Si alguno falla, el push se cancela: arreglá el test o el código y volvé a pushear.

### 5. Abrir la PR

Desde GitHub: al entrar al repo aparece el botón **Compare & pull request** de la rama que acabás de subir. Verificá que la base sea **`dev`**.

O desde la terminal con [GitHub CLI](https://cli.github.com/):

```bash
gh pr create --base dev --fill
```

En la descripción contá **qué** cambia y **por qué**, y cómo probarlo si no es obvio.

### 6. Esperar el CI y la revisión

Al abrir la PR (y con cada push nuevo a la rama), GitHub Actions corre los [checks](../.github/workflows/ci.yml):

| Check | Qué verifica |
|---|---|
| `commitlint` | El formato de todos los commits de la PR |
| `backend` | Que el backend compile y pasen los tests unitarios y de integración |
| `database` | Que las migraciones se apliquen y validen desde cero, y que carguen los seeds |
| `frontend` | Lint, formato, tipos, tests y build del frontend |

Los resultados aparecen al final de la PR. Si uno falla, entrá a **Details** para ver el log, corregí en tu rama y pusheá: los checks se vuelven a correr solos. Para fallas del check `database`, ver los [casos de uso de la BD](../db/casos-de-uso.md).

Otra persona del equipo revisa la PR. Si pide cambios, se hacen con commits nuevos en la misma rama y `git push`; no hace falta abrir otra PR.

```bash
gh pr checks       # estado de los checks de la PR de tu rama
gh pr view --web   # abrir la PR en el navegador
```

### 7. Mergear

Con los checks en verde y la revisión aprobada, se mergea desde GitHub con **Merge pull request**. Después, borrá la rama (GitHub ofrece el botón **Delete branch**) y limpiá tu copia local:

```bash
git switch dev
git pull
git branch -d feat/alta-de-clientes
```

## Mensajes de commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/es/):

```
tipo(alcance opcional): descripción en minúscula y en infinitivo
```

| Tipo | Cuándo |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `docs` | Solo documentación |
| `refactor` | Cambio de código que no agrega funcionalidad ni corrige errores |
| `test` | Agregar o corregir tests |
| `chore` | Configuración, dependencias, scripts, CI |
| `style` | Formato (espacios, comas) sin cambiar la lógica |

El alcance indica la parte del repo: `frontend`, `backend` o `db`. Ejemplos:

```
feat(backend): agregar endpoint de alta de clientes
fix(frontend): mostrar error cuando falla el login
chore(db): agregar migración de la tabla de proveedores
docs: agregar flujo de trabajo de git
```

## Traer los cambios nuevos de `dev` a tu rama

Si mientras trabajabas se mergearon otras PRs a `dev`, traé esos cambios a tu rama si los necesitas (sobre todo si abriste la PR y viste que hay conflictos):

```bash
git switch dev
git pull
git switch feat/alta-de-clientes
git merge dev
```

Si después del merge entraron migraciones nuevas, corré `npm run db:migrate`.

### Resolver conflictos

Si la PR informa conflictos (`CONFLICT ...`), podes hacer lo siguiente (es un poco más complejo en realidad):

1. `git status` lista los archivos en conflicto (_both modified_).
2. En cada uno, buscá las marcas `<<<<<<<`, `=======` y `>>>>>>>`. Arriba está tu versión y abajo la de `dev`: dejá el código correcto (puede ser una, la otra o una combinación) y borrá las marcas. VS Code muestra botones para elegir cada versión.
3. Marcá cada archivo como resuelto y terminá el merge:

   ```bash
   git add <archivo>
   git commit
   ```

4. Corré los tests para verificar que nada se rompió y pusheá.

Si te perdiste en el medio, `git merge --abort` deja todo como estaba antes del merge. Es importante que **si tenes un conflicto con nuevos cambios, coordines con quien hizo los nuevos cambios para ayudarte con tus conflictos, puede agilizar el proceso**.

Un caso particular son dos migraciones con el mismo número: ver el [caso de uso 05 de la BD](../db/casos-de-uso.md#05-solucionar-migraciones-con-el-mismo-número-al-hacer-pr).

## Pasar `dev` a producción (`main`)

Cuando `dev` tiene un conjunto de cambios probados para publicar, se abre una PR de `dev` hacia `main`. Se revisa y se mergea igual que cualquier otra PR. No se mergean ramas de trabajo directo a `main`.

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `git status` | Muestra en qué rama estás y qué archivos cambiaron |
| `git diff` | Muestra los cambios que todavía no agregaste con `git add` |
| `git restore <archivo>` | Descarta los cambios no commiteados de un archivo (**no se puede deshacer**) |
| `git restore --staged <archivo>` | Saca un archivo del `git add` sin perder los cambios |
| `git commit --amend` | Corrige el mensaje (o agrega archivos) al último commit, **solo si todavía no lo pusheaste** |
| `git stash` / `git stash pop` | Guarda temporalmente los cambios sin commitear y los recupera (útil para cambiar de rama a mitad de algo) |
| `git branch` | Lista tus ramas locales |
| `git fetch` | Trae ramas que otro haya pusheado hacia tu entorno local |

## Lo que no hay que hacer

- Commitear o pushear directo a `dev` o `main`.
- Saltear los hooks que corren automáticamente al hacer `commit` o `push` usando `--no-verify`: el CI va a fallar igual en la PR.
- Usar `git push --force` en ramas compartidas. En tu propia rama, si alguna vez hace falta, usá `git push --force-with-lease`.
- Editar una migración `V...` que ya está en `dev`: se crea una nueva (ver [db/README.md](../db/README.md#tipos-de-archivo)).
- Commitear archivos `.env` o credenciales.
