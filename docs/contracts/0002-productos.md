# Resumen

| Endpoint | Requiere sesión | Qué hace | Éxito | Errores |
|---|---|---|---|---|
| `GET /api/productos` | Sí | Busca productos por nombre o código de barras, o los lista a todos | 200 | 400, 401 |
| `GET /api/productos/codigo/{codigo}` | Sí | Devuelve el producto con ese código de barras exacto | 200 | 401, 404 |

Ninguno restringe por rol todavía. Los productos inactivos también se devuelven, porque la venta muestra el motivo de baja y pide autorización (RN-14).

# Endpoints

## GET `/api/productos`

Busca productos o, sin `query`, recorre el catálogo. La respuesta está paginada según el [ADR técnico 0007](../adr/tecnico/0007-paginacion-por-offset.md).

### Query params

| Param | Tipo | Reglas |
|---|---|---|
| `query` | `string` | Opcional. Se recorta; vacío equivale a no mandarlo. Coincide si el nombre o alguno de sus códigos de barras lo contiene, sin distinguir mayúsculas |
| `page` | `number` | Opcional, 1 por defecto. Mínimo 1 |
| `pageSize` | `number` | Opcional, 20 por defecto. De 1 a 500 |

Los resultados se ordenan por nombre y, a igual nombre, por id.

### Response

```json
{
  "data": [
    {
      "id": number,
      "nombre": "string",
      "categoria": "string",
      "codigosBarras": string[],
      "precioUnitario": number,
      "stockActual": number,
      "stockMinimo": number,
      "estado": "Activo" | "Inactivo",
      "motivoBaja": "string" | null
    }
  ],
  "page": number,
  "pageSize": number,
  "total": number
}
```

`precioUnitario` es el precio sin IVA. `codigosBarras` puede venir vacío.

### Códigos HTTP

- **200 Ok**: devuelve la página, aunque no haya resultados.
- **400 Bad Request**: `page` o `pageSize` fuera de rango.
- **401 Unauthorized**: no hay una sesión válida.

## GET `/api/productos/codigo/{codigo}`

Devuelve el producto que tiene ese código de barras, con coincidencia exacta. Lo usa el lector de códigos de barras.

### Response

Un producto con la misma forma que cada elemento de `data` en `GET /api/productos`.

### Códigos HTTP

- **200 Ok**: hay un producto con ese código, activo o inactivo.
- **401 Unauthorized**: no hay una sesión válida.
- **404 Not Found**: ningún producto tiene ese código.
