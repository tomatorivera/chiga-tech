# Flujo de trabajo

Cómo un cambio llega desde una issue hasta `dev`.

## Ramas

| Rama | Qué es |
|---|---|
| `main` | Producción. Solo recibe PRs desde `dev`. Cada merge es una iteración y se replica en [Bitbucket](#iteraciones-y-bitbucket) |
| `dev` | Integración y rama por defecto. Recibe PRs de las ramas de trabajo |
| `tipo/descripcion` | Tu rama de trabajo, una por tarea |

**Nunca se commitea directo a `dev` ni a `main`.** Las ramas usan el tipo del commit y una descripción con guiones: `feat/login-page`, `fix/total-venta-con-descuento`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/es/): `tipo(alcance): descripción en infinitivo`.

| Tipo | Para |
|---|---|
| `feat` | Funcionalidad nueva |
| `fix` | Corrección de un error |
| `refactor` | Cambio de código sin cambiar el comportamiento |
| `test` | Tests |
| `docs` | Documentación |
| `chore` | Configuración, dependencias, scripts, CI |
| `style` | Formato sin cambiar la lógica |

El alcance es opcional: `frontend`, `backend` o `db`.

```
feat(backend): agregar endpoint de alta de clientes
fix(frontend): mostrar error cuando falla el login
chore(db): agregar migración de la tabla de proveedores
```

## Issues

Todo trabajo arranca en una issue. Se crean desde la pestaña "Issues" en github. Al crearla, elegí la plantilla:

| Plantilla | Para | Label |
|---|---|---|
| Reporte de bug | Algo no funciona | `bug` |
| Propuesta de mejora | Cambio que representa una posible mejora sobre algo existente | `enhancement` |
| Spec de funcionalidad | Funcionalidad nueva completa | `spec` |
| Ticket | Parte de una spec, implementable de punta a punta | `ready-for-agent`, `ready-for-human` |

Una spec se divide en tickets. Los criterios de aceptación de la issue pasan al checklist de la PR.

## Ciclo de una tarea

### 1. Crear la rama desde `dev` actualizado

```bash
git switch dev
git pull
git switch -c feat/alta-de-clientes
```

Si el `pull` trajo migraciones: `npm run db:migrate`. Si trajo dependencias: `npm install`.

### 2. Commitear

```bash
git add <archivos>
git commit -m "feat(frontend): agregar formulario de alta de clientes"
```

Commits chicos, cada uno con sentido propio.

### 3. Pushear

```bash
git push -u origin feat/alta-de-clientes   # la primera vez; después, git push
```

### 4. Abrir la PR hacia `dev`

En GitHub, botón **Compare & pull request** (verificá que la base sea `dev`). Completá la plantilla: qué hiciste, cómo probarlo, issues relacionadas (`Closes #12` la cierra al mergear) y checklist.

### 5. CI y revisión

Los checks corren con cada push. Si uno falla, abrí **Details**, corregí y pusheá. Otra persona revisa y aprueba (se necesita al menos una aprobación); los cambios pedidos van como commits nuevos en la misma rama. Un push nuevo anula la aprobación anterior.

```bash
gh pr checks       # estado de los checks
gh pr view --web   # abrir la PR en el navegador
```

### 6. Mergear

Con checks en verde y revisión aprobada: si GitHub muestra **Update branch** (entraron cambios a la base después de abrir la PR), tocalo y esperá que el CI vuelva a pasar. Después, **Merge pull request** y **Delete branch**. Después:

```bash
git switch dev
git pull
git branch -d feat/alta-de-clientes
```

## Validaciones automáticas

Si algo falla, la acción se cancela y te muestra el error. Corregilo y repetí.

| Cuándo | Qué valida |
|---|---|
| `git commit` | Formato del mensaje. Si tocaste el frontend, lint y formato de esos archivos (corrige lo que puede) |
| `git push` | Tests unitarios de la parte que tocaste |
| PR ([CI](../.github/workflows/ci.yml)) | `commitlint`: commits · `backend`: build y tests · `database`: migraciones y seeds desde cero ([si falla](../db/casos-de-uso.md#10-falla-el-job-database-del-ci-en-mi-pr)) · `frontend`: lint, formato, tipos, tests y build · `origen`: que las PRs a `main` vengan de `dev` |
| Push a `main` ([espejo](../.github/workflows/bitbucket.yml)) | No valida: replica `main` en Bitbucket (ver [Iteraciones](#iteraciones-y-bitbucket)) |

## Iteraciones y Bitbucket

Cada merge de `dev` a `main` es una nueva iteración del sistema. La cátedra sigue el avance en [Bitbucket](https://bitbucket.org/EstebanSaborido/2026-grupo6), que es un espejo de `main`: con cada push a `main`, GitHub Actions lo replica solo. No se pushea a Bitbucket a mano.

- Solo se replica `main`; `dev` y las ramas de trabajo quedan en GitHub.
- El push pisa lo que haya en Bitbucket: cualquier cambio hecho allá se pierde.
- Usa el token de Bitbucket guardado en el secret `BITBUCKET_API_KEY` del repo de GitHub. Si vence o se revoca, el workflow falla en la pestaña **Actions**: generá uno nuevo con permiso de escritura en repositorios, actualizá el secret y tocá **Re-run jobs**.

## Otros casos

### Traer cambios de `dev` a tu rama

Cuando necesitás algo ya mergeado, o la PR tiene conflictos:

```bash
git switch dev
git pull
git switch feat/alta-de-clientes
git merge dev
```

Si entraron migraciones: `npm run db:migrate`.

### Resolver conflictos

1. `git status` lista los archivos en conflicto.
2. En cada uno, dejá el código correcto entre `<<<<<<<` (tu versión) y `>>>>>>>` (`dev`) y borrá las marcas. VS Code tiene botones para esto.
3. `git add <archivo>` por cada uno, y `git commit`.
4. Corré los tests y pusheá.

`git merge --abort` vuelve todo atrás. **Si el conflicto es con cambios recientes de otra persona, coordiná con ella.** Migraciones con el mismo número: [caso 05](../db/casos-de-uso.md#05-solucionar-migraciones-con-el-mismo-número-al-hacer-pr).

### Encontrar un bug

| Bug | Qué hacer |
|---|---|
| Chico (un archivo, pocas líneas, no se propaga) | Arreglalo en un commit y seguí |
| Más grande, y te bloquea | Arreglalo en tu rama y seguí |
| Más grande, y no te afecta | Abrí una issue de bug |

## Comandos útiles

| Comando | Qué hace |
|---|---|
| `git status` | Rama actual y archivos cambiados |
| `git diff` | Cambios sin `git add` |
| `git branch` | Tus ramas locales |
| `git fetch` | Trae las ramas que otros pushearon |
| `git stash` / `git stash pop` | Guarda cambios sin commitear / los recupera |
| `git restore --staged <archivo>` | Saca un archivo del `git add` |
| `git restore <archivo>` | Descarta sus cambios (**irreversible**) |
| `git commit --amend` | Corrige el último commit, **solo si no lo pusheaste** |

## No hacer

- Commitear o pushear a `dev` o `main`.
- Saltear los hooks con `--no-verify`: el CI falla igual.
- `git push --force` en ramas compartidas (en la tuya, `--force-with-lease`).
- Editar una migración `V` ya commiteada ([por qué](../db/README.md#migraciones)).
- Commitear `.env` o credenciales.

---

[**<- Anterior**](../frontend/README.md) (frontend) -- [**Volver al inicio ->**](../README.md) (README)
