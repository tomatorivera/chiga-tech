---
name: sync-trello
description: Sincroniza los tickets de GitHub con su tarjeta en el tablero de Trello "Proyecto Final", que sigue el docente. Usala después de publicar tickets con to-tickets, después de editar un ticket, cuando alguien empieza o está trabajando en un ticket cuya tarjeta no está en DOING, y cuando te piden "sincronizá el ticket #N" (o varios, o todos). Si no hay MCP de Trello conectado, sugiere los cambios en vez de hacerlos.
---

# Sincronizar tickets con Trello

El docente que evalúa el proyecto no es técnico y sigue el avance **solo desde Trello**. Cada ticket de GitHub tiene que tener una tarjeta que se entienda sin abrir el repo: qué se construye, en qué estado está, quién lo tiene y qué criterios se cumplieron.

GitHub es la fuente de verdad. Trello es un espejo legible: nunca edites un issue para que coincida con Trello.

## Cuándo usarla

| Momento | Qué sincronizar |
|---|---|
| Al terminar de publicar tickets con `to-tickets` | Crear una tarjeta por cada ticket nuevo, en TO DO. |
| Después de editar un ticket (título, cuerpo, criterios, asignados, bloqueos) | Actualizar su tarjeta. |
| Cuando alguien empieza a trabajar en un ticket (pide implementarlo, crea su rama, dice "arranco con el #N") | Mover a DOING y comentar desde cuándo. |
| Cuando notás que se está trabajando en un ticket (rama, commits o PR abiertos) y su tarjeta sigue en TO DO, o no existe | Lo mismo: crearla si falta y moverla a DOING. |
| Cuando se mergea la PR que cierra el ticket o se cierra el issue | Mover a DONE, marcar completa y tildar criterios. |
| Cuando te piden "sincronizá el ticket #N", "#N y #M" o "todos los tickets" | Dejar cada tarjeta igual al issue. |

En los casos automáticos (filas 1 a 5), sincronizá al final de la tarea principal, sin interrumpirla, y contalo en una línea.

## 0. ¿Hay MCP de Trello?

Buscá herramientas cuyo nombre contenga `trello` (por ejemplo `trelloReadCard`, `trelloWriteCard`; el prefijo cambia según el cliente). Si están diferidas, cargalas.

- **Si están:** seguí con el paso 1 y aplicá los cambios.
- **Si no están:** no busques otra vía (ni la API REST de Trello, ni tokens, ni navegador). Armá igual el plan de los pasos 1 a 4 y mostralo como sugerencia:

  > 📋 **Trello no está conectado en esta sesión.** Para que el docente vea este avance, habría que hacer esto en el tablero [Proyecto Final](https://trello.com/b/zUuAA9nZ/proyecto-final):
  > - Ticket #N → mover a 🚧 DOING y comentar "🚧 En curso desde …"
  > - …
  >
  > Podés conectar el conector de Trello en tu cliente y pedirme "sincronizá el ticket #N", o hacerlo a mano.

  Para una tarjeta nueva, incluí el nombre, la descripción y la checklist completas, listas para copiar.

## 1. Leer el ticket

```bash
gh issue view <N> --json number,title,body,state,stateReason,assignees,labels,url,closedAt
```

Si `gh` no está disponible, el repo es público: `curl -s https://api.github.com/repos/tomatorivera/chiga-tech/issues/<N>`.

- Solo se sincronizan **tickets** (label `ready-for-agent` o `ready-for-human`). Las specs (`spec`), bugs y mejoras no llevan tarjeta propia salvo que te lo pidan.
- Un número que resulta ser una PR no es un ticket: usá la PR solo como señal de estado (paso 2).

## 2. Decidir la lista

| Estado en GitHub | Lista | Además |
|---|---|---|
| Cerrado como completado | ✅ \| DONE | `mark_done` y tildar todos los criterios. |
| Cerrado como "not planned" | No la muevas | Comentá "⛔ Se descartó el ticket el AAAA-MM-DD." y avisale al usuario: él decide si se archiva. |
| Abierto, con trabajo en curso (alguien empezó, o hay rama, commits o PR que lo nombran) | 🚧 \| DOING | Comentario de estado si recién entra. |
| Abierto, sin trabajo | 💻 \| TO DO | — |

Para detectar trabajo en curso: `gh pr list --state open --search "<N> in:body"`, las ramas (`git branch -a`) y los commits recientes que nombran el ticket o su funcionalidad. Si la señal es dudosa, preguntá antes de mover.

No muevas una tarjeta de DONE hacia atrás salvo que el issue se haya reabierto. No toques la lista 🚨 \| PRIORIDAD: la maneja el equipo; si una tarjeta está ahí, dejala y sincronizá solo su contenido.

## 3. Formato de la tarjeta

Escribí todo en español rioplatense, en lenguaje para alguien **no técnico**: lo que el usuario del sistema puede hacer, no clases, endpoints ni librerías (salvo que no haya otra forma de decirlo).

**Nombre:** `Ticket #<N> - <título del issue>`

**Descripción:**

```markdown
🔗 **Ticket completo en GitHub:** https://github.com/tomatorivera/chiga-tech/issues/<N>

**Qué se construye:** <1 a 3 líneas a partir de "Qué construir": qué va a poder hacer el usuario>

**Viene de:** [Spec #<S> - <título corto>](https://github.com/tomatorivera/chiga-tech/issues/<S>) | sin spec (<motivo que da el ticket>)
**Depende de:** Ticket #<B>, Ticket #<C> | nada
```

**Checklist** llamada `Criterios de aceptación`:

- Un ítem por criterio relevante de "Criterios de aceptación", reescrito corto y sin jerga.
- Dejá afuera lo que no le dice nada al docente: actualizar un README, un ADR o un contrato, ajustes de CI o de dependencias. Si un criterio agrupa sub-ítems, resumilos en uno.
- Creá los ítems con `pos` 1, 2, 3… para que queden en orden aunque los crees en paralelo.
- Tildá un ítem cuando el ticket está cerrado o cuando la PR que lo implementa tiene ese criterio tildado.

**Comentario de asignado:** `👤 Asignado: <nombres>` con los asignados del issue, traducidos con la tabla de abajo. Si no hay, `👤 Asignado: sin asignar en GitHub`. El MCP no puede asignar miembros: la asignación real la hace el equipo a mano en Trello.

**Comentarios de estado** (uno por cada cambio de lista, con fecha en hora de Argentina):

- `🚧 En curso desde el DD/MM/AAAA.` y, si suma, qué se hizo hasta ahora en una línea.
- `✅ Terminado el DD/MM/AAAA (PR #<P>): <qué quedó funcionando, en una línea>.`

### Equivalencias GitHub → Trello

| GitHub | Trello |
|---|---|
| tomatorivera | Ramiro Tomas Rivera Octtaviano |
| GuilloValle | Guillermo A. Valle |
| juanigramajo | Juani Gramajo |

Si aparece alguien que no está en la tabla, buscalo con `trelloReadMember` (`list_by_board`) y avisá que conviene sumarlo acá.

## 4. Aplicar los cambios

### Encontrar la tarjeta

Listá el tablero con `trelloReadCard` (`list_by_board`, `limit: 50`) y quedate con la tarjeta cuyo nombre empieza exactamente con `Ticket #<N> -`. No uses `trelloSearch` con `"Ticket #<N>"`: la búsqueda de Trello ignora el `#` y el número, y no la encuentra. Si sincronizás varios tickets, listá el tablero una sola vez. **Nunca crees una segunda tarjeta para el mismo ticket.**

### Si no existe

1. `trelloWriteCard` `create` en la lista del paso 2, con nombre y descripción (`pos: "top"`).
2. `trelloWriteChecklist` `create` y después `add_item` por cada criterio.
3. Comentario de asignado y, si no está en TO DO, el de estado.
4. Si va a DONE: `mark_done` y tildá los ítems con `update_item` (`checked: true`).

### Si existe

Compará y cambiá solo lo que difiere:

- **Nombre o descripción:** `update`.
- **Lista:** `move` (y el comentario de estado).
- **Criterios:** leé la checklist con `trelloReadChecklist`. Renombrá los ítems que cambiaron (`update_item` con `text`) y agregá los nuevos. El MCP no puede borrar ítems: a uno que ya no aplica, renombralo a `❌ Descartado: <texto>` y dejalo tildado.
- **Asignados:** buscá el comentario que empieza con `👤` (`list_comments`) y actualizalo con `update_comment`. Si no existe, crealo.

### Nunca

- Borrar o archivar tarjetas, ni tocar las que no son tickets (IDEAS, TOOLS, documentos, tarjetas viejas del equipo).
- Asignar o quitar miembros, ni cambiar etiquetas o fechas que puso el equipo.
- Editar issues de GitHub para que coincidan con Trello.

## Referencia del tablero

- Tablero: [Proyecto Final](https://trello.com/b/zUuAA9nZ/proyecto-final), workspace "Proyecto Final PU". Si cambian los IDs, buscalo por nombre con `trelloSearch` (`search_boards`).

| Qué | ID |
|---|---|
| Tablero | `ari:cloud:trello::board/workspace/6ab185a5caa5bdd6b1509895/6ab18710a8e905817f476b73` |
| 💻 \| TO DO | `ari:cloud:trello::list/workspace/6ab185a5caa5bdd6b1509895/6ab1874c07096d7a64c03fbb` |
| 🚧 \| DOING | `ari:cloud:trello::list/workspace/6ab185a5caa5bdd6b1509895/6ab187ca61f614120a5d4beb` |
| 🚨 \| PRIORIDAD | `ari:cloud:trello::list/workspace/6ab185a5caa5bdd6b1509895/6ab187c6354b5cb8be762cb5` |
| ✅ \| DONE | `ari:cloud:trello::list/workspace/6ab185a5caa5bdd6b1509895/6ab1874feb80da41c3f65743` |

## Al terminar

Contale al usuario en pocas líneas qué tarjetas creaste o moviste, con su link. Si fue una sugerencia sin MCP, el bloque del paso 0 es el resumen.
