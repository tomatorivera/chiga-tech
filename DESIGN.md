# Diseño de Chiga Tech

Guía para diseñar cualquier pantalla del sistema. Sale de lo que ya está construido (login, tokens en `frontend/src/index.css`) y de la dirección elegida para el resto: un panel **sin bordes**, espaciado y fácil de leer. Si una pantalla nueva contradice esta guía, se corrige la pantalla o se actualiza la guía en el mismo cambio, no se deja la diferencia.

## 1. Para quién diseñamos

Quien usa el sistema atiende un mostrador: puede tener 20 o 70 años, puede usar la computadora todos los días o solo para esto, y casi siempre tiene un cliente esperando. De ahí salen cinco principios, ordenados por prioridad:

1. **Se entiende leyendo, sin probar.** Cada dato lleva su etiqueta en palabras comunes ("Quedan 11", "Debe $ 32.500"), cada botón dice qué hace ("Cobrar venta", no "Confirmar"). Nada depende de saber qué significa un ícono o un color (RNF-04, RNF-14).
2. **Todo lo necesario para decidir está a la vista.** Lo que hace falta para la tarea del momento se ve en la misma pantalla sin abrir otro panel: en una venta, el stock, el precio, el saldo del cliente y el total están juntos. Lo que no se usa en esa tarea no aparece.
3. **Una acción principal por pantalla.** Un solo botón primario visible; el resto es secundario o queda en un menú.
4. **Espacio antes que bordes.** Los grupos se separan con aire y con un cambio de fondo, no con líneas (sección 3).
5. **Se usa con teclado, lector de código de barras o mouse**, con la misma facilidad (RNF-03, RNF-15).

### Pantalla de referencia

Se diseña para monitores de escritorio de **1366×768** (el caso más común en un local) y tiene que verse bien de 1280 a 1920 de ancho. No hay una experiencia móvil integral (RNF-01), pero las vistas de Productos y Clientes tienen una adaptación específica desde 390px. El resto de la aplicación no se rompe a 1024. A 768 de alto el espacio vertical es escaso: lo importante va arriba y no se esconde abajo del pliegue.

## 2. Tokens

Los tokens viven en `@theme` de `frontend/src/index.css` y se usan como clases de Tailwind (`bg-canvas`, `text-muted`). **No se escriben colores sueltos en los componentes**: si falta uno, se agrega como token.

### Color

| Token | Valor | Uso |
|---|---|---|
| `brand` | `#173b32` | Verde de la marca. Panel del login, fondo del menú lateral, fondo de avisos destacados. |
| `accent` | `#c7e77e` | Lima de acento. Ítem activo del menú, selección de texto, detalles de marca. Nunca como color de texto sobre blanco. |
| `canvas` | `#f8f9f5` | Fondo de la zona de contenido. |
| `surface` | `#ffffff` | Fondo de los bloques de contenido (tarjetas, tablas, paneles). |
| `ink` | `#1e3029` | Texto principal y cifras. |
| `ink-soft` | `#34463e` | Etiquetas de campos y texto secundario importante. |
| `muted` | `#636f68` | Descripciones, encabezados de tabla, metadatos. Contraste AA sobre `canvas` y `surface`. |
| `line` | `#dfe5de` | Separadores entre filas de tabla. Es el único borde decorativo permitido. |
| `line-strong` | `#c6d2c8` | Separadores punteados de comprobantes. |
| `line-control` | `#86918a` | Borde de campos de formulario: contrasta 3:1 para que se vea el control. |
| `primary` / `primary-hover` | `#285644` / `#204b3a` | Botón principal y enlaces. |
| `focus` | `#527863` | Contorno de foco. |
| `danger` | `#c4604d` | Borde y contorno de un campo con error. No se usa como texto. |
| `danger-ink` / `danger-surface` / `danger-line` | `#c42b1c` / `#fde7e1` / `#f7cfc4` | Errores, acciones destructivas e inactivos. |
| `warning-ink` / `warning-surface` | `#9e5c00` / `#fff1cf` | Stock bajo (RF-20), deuda en cuenta corriente, cuenta por vencer, autorización pendiente. |
| `success-ink` / `success-surface` | `#2b6b4c` / `#eaf5ee` | Venta cobrada, saldo a favor, habilitado. |

Los textos `danger-ink` y `warning-ink` tienen contraste AA tanto sobre `surface` como sobre su propio fondo suave.

Reglas de color:

- Sin violeta ni lavanda. La paleta es verde, lima y neutros cálidos verdosos.
- El color nunca es la única señal: un estado lleva texto ("Stock bajo") y, si suma, un ícono.
- Los degradados quedan para el panel de marca del login. Las pantallas de trabajo usan fondos planos.

### Tipografía

- **Atkinson Hyperlegible Next** para todo el texto de la interfaz: está hecha para baja visión y distingue `I l 1`, `0 O` y `rn m`.
- **Schibsted Grotesk** (`font-display`) para títulos de página, totales y cifras grandes.
- **Atkinson Hyperlegible Mono** (`font-mono`) solo para códigos que se comparan carácter por carácter: código de barras, número de comprobante, código de producto.
- Las cifras van siempre con `tabular-nums` para que las columnas de importes se alineen (las dos primeras lo admiten; la mono ya es de ancho fijo).

| Rol | Clases | Ejemplo |
|---|---|---|
| Título de página | `font-display text-[28px] font-semibold tracking-tight text-ink` | "Ventas" |
| Título de bloque | `font-display text-lg font-semibold text-ink` | "Venta en curso" |
| Cifra destacada (KPI, total) | `font-display text-[32px] font-semibold tabular-nums text-ink` | "$ 172.400" |
| Texto base | `text-base text-ink` (16px) | Celdas de tabla, valores de campos |
| Etiqueta | `text-sm font-semibold text-ink-soft` (14px) | "Cliente", "Medio de pago" |
| Secundario | `text-sm text-muted` | Descripciones, encabezados de tabla |
| Mínimo | `text-[13px]` | Solo ayudas y errores debajo de un campo. Nada más chico. |

El texto base es de 16px en las pantallas frecuentes (venta, productos, clientes): se lee de lejos y sin anteojos. No se baja para "hacer entrar" más datos; se muestran menos.

### Espaciado

Escala de Tailwind (múltiplos de 4px). Valores fijos para que todas las pantallas respiren igual:

| Dónde | Valor |
|---|---|
| Margen de la zona de contenido | `px-8 py-6` |
| Separación entre bloques | `gap-6` (24px) |
| Relleno interior de un bloque | `p-6` |
| Entre etiqueta y campo | `mb-2` |
| Entre campos de un formulario | `space-y-5` |
| Alto de fila de tabla | 56px (`h-14`) |

### Forma y profundidad

- Radios: `rounded-lg` (8px) para campos y botones, `rounded-2xl` (16px) para bloques, `rounded-full` para chips de estado.
- Sombras: solo `shadow-control` en campos y `shadow-action` en el botón principal. Los bloques **no llevan sombra**: se distinguen por el fondo blanco sobre `canvas`.
- Las capas que flotan (menús desplegables, diálogos, avisos emergentes) llevan una sombra suave y difusa, como `shadow-[0_12px_32px_rgb(23_59_50/.12)]`.

### Movimiento

Corto y desacelerado, para que nada demore a quien trabaja: transiciones de 160ms con `ease-out-quart` (por defecto en el tema), `animate-enter` para la entrada de una pantalla y `animate-reveal` para mensajes que aparecen. Siempre con `motion-safe:`. Nada se mueve por hacer scroll y nada parpadea.

## 3. Sin bordes

La jerarquía se arma con **dos fondos y espacio**:

- `canvas` es el piso: fondo de la zona de contenido. El menú lateral va en `brand` y se separa del contenido por el cambio de fondo, sin línea.
- `surface` (blanco) es el bloque: una tarjeta, una tabla o un panel es un rectángulo blanco `rounded-2xl` sobre `canvas`, sin borde ni sombra.
- Adentro de un bloque, los subgrupos se separan con espacio (`gap-6`) o con un fondo `canvas` suave (por ejemplo, el resumen de totales).

Los bordes quedan para lo que tiene que verse como control:

- Campos de texto, selects y casillas (`border-line-control`), porque una persona tiene que reconocer dónde escribir.
- Botones secundarios (`border-line`), para que se lean como botón y no como texto.
- Una línea `border-line` entre filas de tabla. Sin líneas verticales ni recuadro externo.

Como no hay bordes que ordenen, el espacio no se ahorra: si un bloque se siente apretado, se saca contenido; no se le pone un borde.   

### Menú lateral

- Ancho fijo de 240px, fondo `brand` para que se distinga del contenido a simple vista, logo (`Wordmark` en `canvas`, con su punto `accent`) arriba.
- Sobre `brand`, los textos van en blanco translúcido: ítems al 82%, rótulos de grupo y roles al 62–72%, siempre con contraste AA. Hover con `white/8`; el foco usa `accent` en vez de `focus`, que no contrasta sobre verde.
- Cada ítem lleva **ícono y texto, siempre**: nunca solo ícono, ni siquiera colapsado. Alto de 44px, `rounded-lg`, `text-base`.
- Ítem activo: fondo `accent` sólido, texto `brand`, `font-semibold`, y `aria-current="page"`.
- Agrupado por tarea, con un rótulo por grupo en `text-sm font-bold` blanco al 94%, alineado con el borde izquierdo de los ítems: "Mostrador" (Vender), "Ventas y clientes" (Ventas, Clientes), "Catálogo" (Productos, Categorías, Stock, Proveedores, Listas de precios) y "Administración" (Reportes, Usuarios, Auditoría, Configuración). Solo aparecen los ítems que el rol permite (RNF-05); un usuario con varios roles ve la unión.
- "Mostrador" reúne lo que usa quien atiende la caja; por ahora, solo "Vender". "Vender" va primero y se distingue con su ícono `accent` sobre un cuadro `accent/16` (`brand` cuando está activo): es la tarea más frecuente.
- "Clientes" es un solo ítem: adentro están la gestión, la cuenta corriente, los cobros y las facturas vencidas.
- Un contador junto al ítem es un chip con número (`warning` para ventas pendientes de autorización, `danger` para facturas vencidas) y un texto oculto para lectores ("3 pendientes de autorización").
- El pie de la barra es un bloque `white/7` y `rounded-xl` (en una columna de 240px, `rounded-2xl` lo hace parecer una tarjeta de contenido) fijo con el usuario (iniciales en `accent`, nombre y roles) y el botón "Cerrar sesión", secundario adaptado al fondo oscuro (borde `white/24`, texto blanco). La acción peligrosa sobre `brand` usa un rojo claro (`#ffb4a6`), porque `danger-ink` no contrasta; si se repite fuera del menú, pasa a token. Si hay una venta sin cobrar, el pie pide confirmación en el lugar ("Volver a la venta" / "Cerrar sesión igual"), sin diálogo; `Esc` vuelve.
- Los grupos hacen scroll entre el logo y el pie, con una sombra suave arriba o abajo solo cuando hay más contenido.
- Por debajo de 1024px el menú se colapsa a 112px: ícono arriba y texto de 13px abajo, sin rótulos de grupo visibles, y los textos largos se abrevian ("Listas de precios" → "Listas", nombre completo → nombre de pila). La confirmación de salida flota al costado.

### Encabezado de página

- Título de página y una bajada de una línea que dice qué se hace ahí ("Buscá un producto para ver su precio y stock").
- A la derecha: fecha del día y avisos. El usuario y su rol van en el pie del menú lateral, no acá. Sin barra con borde inferior: el encabezado se apoya en `canvas`.
- La acción principal de la página (por ejemplo "Agregar producto") va a la derecha del título, no escondida en otro lado.

### Zona de contenido

- Máximo cuatro tarjetas de indicadores (KPI) por fila y solo en pantallas de resumen o reportes. Las pantallas de trabajo (vender, cargar un producto) no llevan KPI.
- Diseño de dos columnas cuando hay un elemento en curso (una venta, un cliente seleccionado): la lista a la izquierda (flexible) y el detalle a la derecha (`w-96` aprox.). El detalle muestra todo lo necesario sin otra pantalla.

## 5. Componentes

### Botones

| Tipo | Uso | Clases base |
|---|---|---|
| Primario | La acción principal: una por pantalla | `rounded-lg bg-primary px-5 py-3 text-white shadow-action hover:bg-primary-hover hover:shadow-action-hover motion-safe:active:translate-y-px` |
| Secundario | Acciones de apoyo | `rounded-lg border border-line bg-surface px-4 py-2.5 text-ink-soft hover:border-line-strong hover:bg-canvas` |
| Fantasma | Acciones dentro de una fila, filtros | `rounded-lg px-3 py-2 text-ink-soft hover:bg-canvas` |
| Peligro | Dar de baja, rechazar, anular | Como el secundario, con `text-danger-ink hover:bg-danger-surface` |

- Todos: alto mínimo de 44px (36px solo en acciones dentro de filas de tabla), `cursor-pointer`, foco visible `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`.
- El texto es verbo y objeto: "Cobrar venta", "Guardar cliente", "Agregar producto". Nada de "Aceptar" u "OK".
- Mientras procesa: `LoaderCircle` girando, texto en gerundio ("Guardando…") y `disabled`. El botón no cambia de ancho bruscamente.
- Un botón de solo ícono lleva `aria-label` y tooltip, y queda solo para acciones obvias por contexto (cerrar, quitar ítem).

### Campos de formulario

Siguen el patrón ya construido en `LoginForm.tsx`:

- Etiqueta visible arriba (`label` con `htmlFor`), nunca solo un placeholder.
- Campo `rounded-lg border border-line-control bg-surface py-3 px-4 shadow-control`, con ícono a la izquierda solo cuando ayuda a reconocerlo (búsqueda, usuario).
- Error debajo del campo, en `text-[13px] text-danger-ink`, con `aria-invalid` y `aria-describedby`. Al fallar el envío, el foco va al primer campo con error.
- Los importes se escriben en un campo alineado a la derecha, con el signo `$` fijo a la izquierda.
- Formularios en una columna, de `max-w-xl`. Dos campos en la misma fila solo si son un par natural (nombre y apellido; sector y estante).

### Búsqueda

- Es la entrada principal de casi todo el sistema. Ancho amplio, ícono `Search`, placeholder que dice qué se puede buscar ("Buscá por nombre o código de barras").
- Muestra su atajo como tecla visible (`kbd`): `/` o `F2` enfoca la búsqueda.
- En la pantalla de venta recibe el foco al abrirla y vuelve a tenerlo después de agregar cada producto, para que el lector de código de barras funcione siempre.
- Busca mientras se escribe; sin resultados, lo dice en palabras y ofrece la siguiente acción ("No hay productos con 'ssd 2tb'. Probá con otro nombre").

### Tablas

- Bloque `surface rounded-2xl` sin recuadro; filas de 56px separadas por `border-b border-line`; la última sin línea.
- Encabezados en `text-sm font-medium text-muted`, sin mayúsculas sostenidas.
- Importes y cantidades alineados a la derecha con `tabular-nums`; texto a la izquierda.
- Fila al pasar el mouse: `hover:bg-canvas`. Si la fila abre un detalle, toda la fila es clickeable y alcanzable con teclado.
- Pocas columnas: las que se necesitan para reconocer y decidir. Lo demás va en el detalle. Si una tabla pasa de seis columnas, sobra alguna.
- Paginación o "Cargar más" abajo, con el total en palabras ("Mostrando 25 de 312 productos").
- Sin casillas de selección múltiple salvo que exista una acción en lote real.

### Tarjeta de indicador (KPI)

```
┌─────────────────────────────┐
│ [ícono]  Vendido hoy        │   ícono en cuadro canvas de 40px
│          $ 1.250.000        │   cifra font-display 32px
│          ▲ 12% que ayer     │   variación con texto, no solo flecha
└─────────────────────────────┘
```

Bloque `surface rounded-2xl p-6`. La variación dice contra qué se compara.

### Chips de estado

`rounded-full px-2.5 py-1 text-[13px] font-semibold`, con fondo suave y texto oscuro del mismo tono, y siempre una palabra:

| Estado | Estilo |
|---|---|
| Confirmada, Cobrada, Habilitado | `success-surface` / `success-ink` |
| Pendiente de autorización, Stock bajo | `warning-surface` / `warning-ink` |
| Rechazada, Deshabilitado, Vencida | `danger-surface` / `danger-ink` |
| Neutro (Contado, Cuenta corriente) | `canvas` / `ink-soft` |

### Avisos

- En línea, arriba del contenido que afectan: como el error del login (`rounded-lg border border-danger-line bg-danger-surface px-3.5 py-3 text-sm`, ícono `CircleAlert`, `role="alert"`).
- Confirmaciones breves ("Venta cobrada") como aviso emergente abajo a la derecha, con `role="status"`, que se va solo a los 5 segundos y con un enlace a lo creado ("Ver comprobante").

### Diálogos

- Para confirmar algo que no se puede deshacer (dar de baja, rechazar una venta) y para la **autorización con código de supervisor** (ADR-0003).
- `<dialog>` nativo, `rounded-2xl p-6`, ancho `max-w-md`, título que nombra la operación y texto que explica qué va a pasar con datos concretos ("La venta de $ 172.400 a Gómez supera su límite de crédito por $ 22.400").
- Foco al primer campo; `Esc` cierra; el botón que confirma dice la acción ("Autorizar venta", "Dar de baja").
- La autorización nunca saca a la persona de la venta: el diálogo se abre encima y al cerrarse la venta sigue donde estaba.

### Estados vacíos y de carga

- Vacío: una frase que dice por qué está vacío y la acción para salir de ahí ("Todavía no hay clientes. Agregá el primero").
- Carga: esqueletos con la forma del contenido (filas grises de la altura real), no un spinner a pantalla completa. `LoadingScreen` actual queda solo para la verificación de sesión inicial.

## 6. Pantalla de venta

Es la pantalla más usada y la que más se cuida (RF-37 a RF-42, RNF-03). Sigue el modelo de dos columnas de las referencias de punto de venta:

```
┌───────────────────────────────────────────┬────────────────────────┐
│ [🔍 Buscá o escaneá un producto      F2 ] │ Venta en curso         │
│                                           │ Cliente: Consumidor    │
│ Resultados o productos frecuentes         │ final        [Cambiar] │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐    │ ─────────────────────  │
│ │ SSD 1 TB │ │ Mouse    │ │ Teclado  │    │ SSD 1 TB     − 1 +  🗑 │
│ │$ 89.000  │ │$ 18.500  │ │$ 64.900  │    │ $ 89.000               │
│ │Quedan 11 │ │Quedan 3 ⚠│ │Sin stock │    │ Mouse        − 2 +  🗑 │
│ └──────────┘ └──────────┘ └──────────┘    │ $ 37.000               │
│                                           │ ─────────────────────  │
│                                           │ Subtotal     $ 126.000 │
│                                           │ Descuento    − $ 0     │
│                                           │ Total        $ 126.000 │
│                                           │ Contado · Efectivo  ▾  │
│                                           │ [  Cobrar $ 126.000  ] │
└───────────────────────────────────────────┴────────────────────────┘
```

- **Izquierda:** búsqueda arriba, siempre con foco. Debajo, resultados como lista o tarjetas grandes con nombre, precio y stock en palabras ("Quedan 3", "Sin stock"). Un clic, `Enter` o el lector agregan el producto.
- **Derecha:** la venta en curso, siempre visible. Cliente arriba con su saldo y límite si es cuenta corriente. Cada ítem con cantidad editable (`−`/`+` de 36px y campo numérico), precio y quitar. Abajo, el resumen sobre un fondo `canvas` y el total en cifra grande.
- **Cobrar** es el único botón primario: ancho completo, muestra el total en el texto y tiene atajo visible (`F12` o `Ctrl+Enter`).
- Las advertencias aparecen en el lugar del problema: stock bajo junto al ítem, límite de crédito junto al cliente, descuento mayor al 10% junto al descuento. Ninguna interrumpe con un diálogo salvo la autorización.
- El precio que se muestra y los totales vienen calculados por el backend; el frontend no hace cuentas con dinero.

## 7. Cómo se muestran los datos

- **Dinero:** `$ 18.500` con separador de miles de es-AR, sin decimales cuando son cero y con dos cuando no (`$ 18.500,50`). Saldos con palabra: "Debe $ 32.500", "A favor $ 4.000"; no un número negativo en rojo.
- **Fechas:** `5/11/2026` y `5/11/2026 14:32` en hora de Argentina (RNF-09). En listas recientes, "Hoy 14:32" y "Ayer 18:05".
- **Cantidades y stock:** con su unidad o con una frase ("Quedan 11", "11 unidades"). Stock negativo se muestra como "Faltan 2".
- **Nombres completos** en lugar de códigos: "Juan Gómez", no "CLI-0042". El código aparece al lado, en `text-muted`, si hace falta para buscar.
- **Sin siglas ni jerga** en la interfaz: "Cuenta corriente", no "CC"; "Nota de crédito", no "NC". Los términos son los de `docs/CONTEXT.md`.
- **Etiqueta y valor juntos:** una cifra nunca aparece sola sin decir qué es.

## 8. Accesibilidad y teclado

- Contraste AA en todo el texto; 3:1 en bordes de controles y en íconos que transmiten algo.
- Objetivos de clic de 44px (36px en acciones dentro de filas).
- Foco siempre visible con `outline-focus`; el orden de tabulación sigue el orden visual.
- Enlace "Saltar al contenido" en cada pantalla, como en el login. En las pantallas con menú lo pone `MainLayout`, que también es dueño del `main`: las páginas no lo repiten.
- Cada página titula la pestaña "Nombre de la página - Chiga Tech" con `useDocumentTitle`, y su `h1` lleva `tabIndex={-1}`: al navegar dentro de la app, el foco va a ese título para que el lector anuncie la página nueva.
- Etiquetas semánticas: `nav` para el menú, `main` para el contenido, `header` para el encabezado de página, `table` para las tablas, `dialog` para los diálogos.
- Los atajos de teclado se muestran en la interfaz (`kbd`) y no reemplazan una acción visible.
- Íconos decorativos con `aria-hidden="true"`; íconos de `lucide-react` en 18px junto al texto y 20px en el menú.

## 9. Textos

- Español rioplatense con voseo: "Buscá un producto", "Agregá el primer cliente".
- Frases cortas que dicen qué hacer, no qué falló técnicamente: "No se pudo guardar el cliente. Revisá tu conexión y probá de nuevo".
- Títulos que nombran la cosa ("Clientes", "Venta en curso"), no slogans.

## 10. Lo que no se hace

- Bordes o sombras en tarjetas y paneles para separarlos.
- Más de un botón primario visible.
- Íconos sin texto en el menú o en acciones que no son obvias.
- Datos que solo se ven al pasar el mouse.
- Texto de menos de 13px, o letras grises claras para "despejar" la pantalla.
- Pantallas con más de cuatro KPI o tablas con más de seis columnas.
- Violeta, degradados en pantallas de trabajo, elementos rotados (la tarjeta inclinada del login es parte de la marca y queda ahí).
- Colores escritos a mano en vez de tokens (`LoadingScreen` y el encabezado de `Homepage` todavía los tienen y se migran cuando se toquen).

## 11. Antes de dar una pantalla por terminada

- [ ] Una persona que nunca la vio sabe qué hacer en ella leyendo los textos.
- [ ] Todo lo necesario para la tarea está a la vista sin abrir otro panel.
- [ ] Hay un solo botón primario y dice verbo y objeto.
- [ ] Los bloques se separan con fondo y espacio, sin bordes ni sombras.
- [ ] Se ve completa en 1366×768 y no se rompe en 1280 ni en 1920.
- [ ] Se puede completar con teclado, con foco visible y en orden.
- [ ] Usa solo tokens del tema; las cifras con `tabular-nums` y formato es-AR.
- [ ] Ningún estado depende solo del color.
