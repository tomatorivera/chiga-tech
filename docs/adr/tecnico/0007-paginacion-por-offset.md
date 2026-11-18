---
status: accepted
---

# Los listados de la API se paginan por offset

Todo endpoint que devuelve una colección pagina sus resultados con `page` y `pageSize` como query params opcionales, y responde con la página y el total de registros. Se pagina desde el primer listado, porque el mismo endpoint sirve para buscar y para recorrer la colección completa, y agregar la paginación después cambiaría la forma de la respuesta para quienes ya la consumen.

```
GET /api/productos?query=ryzen&page=2&pageSize=50
```

```json
{
  "data": [ ... ],
  "page": 2,
  "pageSize": 50,
  "total": 137
}
```

## Considered Options

- **Tope fijo sin paginación**: descartada. Sin `query` el endpoint recorre la colección, y con un tope fijo los registros que quedan después del tope no se pueden alcanzar.
- **Paginación por cursor (keyset)**: descartada. Rinde mejor con tablas muy grandes, pero no permite saltar a una página puntual, y con el volumen esperado (RNF-02, hasta 10.000 registros) el offset no es un problema.
- **Metadatos en headers (`Link`, `X-Total-Count`)**: descartada. Los datos de la página quedan separados del body y el frontend tiene que leerlos aparte.

## Consequences

- `page` empieza en 1 y vale 1 por defecto. `pageSize` vale 20 por defecto y acepta de 1 a 500. Un valor fuera de rango responde 400 con el [formato de error](../../contracts/0000-errores.md).
- Una página posterior a la última responde 200 con `data` vacío.
- `total` sale de un `COUNT(*)` con el mismo filtro que la página.
- El orden tiene que ser estable: si el criterio de orden no es único, como el nombre, se desempata por id. Sin ese desempate, un registro puede repetirse o saltearse entre páginas.
- La respuesta tiene la misma forma en todos los listados, así que el backend la define una sola vez como tipo genérico y el frontend la replica a mano.

## Excepción: el catálogo de productos

La pantalla de Productos agrupa el catálogo por familia y categoría, con las categorías colapsadas, y filtra por familia, por estado y por texto. Con páginas, un grupo queda repartido entre varias y los totales y los filtros solo ven la página cargada. Por eso la pantalla trae el catálogo completo con un endpoint propio sin paginar y resuelve en el cliente la agrupación, los totales y los filtros.

- Solo se dibujan las filas de las categorías abiertas, así que el costo de la pantalla está en la descarga y no en el render.
- El volumen está acotado por RNF-02: una casa de computación grande ronda los 4.000 productos activos y, con los inactivos que se acumulan con los años, llega a unos 10.000. La respuesta viaja comprimida.
- `GET /api/productos` sigue paginado: la venta busca un producto entre muchos y no necesita el catálogo entero.
- Se descartó subir el tope de `pageSize`: la pantalla dependería de un límite que alguien puede volver a bajar sin saber que la rompe.
- Si las mediciones muestran que la descarga no cumple RNF-02, el catálogo puede traer los inactivos aparte, solo cuando se elige ese filtro.
