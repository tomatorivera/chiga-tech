# Resumen

| Endpoint | Requiere sesión | Qué hace | Éxito | Errores |
|---|---|---|---|---|
| `GET /api/clientes` | Sí | Busca clientes por nombre o razón social, o por número de documento, o los lista a todos | 200 | 400, 401 |

No restringe por rol todavía. Los clientes inactivos también se devuelven, porque la venta muestra el motivo de baja y pide autorización (RN-14).

# Endpoints

## GET `/api/clientes`

Busca clientes o, sin `query`, recorre la lista completa. La respuesta está paginada según el [ADR técnico 0007](../adr/tecnico/0007-paginacion-por-offset.md).

### Query params

| Param | Tipo | Reglas |
|---|---|---|
| `query` | `string` | Opcional. Se recorta; vacío equivale a no mandarlo. Coincide si el nombre o razón social, o el número de documento lo contiene, sin distinguir mayúsculas. Así un DNI encuentra también el CUIT o CUIL que lo incluye |
| `page` | `number` | Opcional, 1 por defecto. Mínimo 1 |
| `pageSize` | `number` | Opcional, 20 por defecto. De 1 a 500 |

Los resultados se ordenan por nombre o razón social y, a igual nombre, por id.

### Response

```json
{
  "data": [
    {
      "id": number,
      "nombreRazonSocial": "string",
      "tipoDocumento": "string",
      "nroDocumento": "string",
      "condicionIva": "string",
      "estado": "Activo" | "Inactivo",
      "motivoBaja": "string" | null,
      "esConsumidorFinal": boolean,
      "cuentaCorriente": {
        "limiteCredito": number,
        "saldo": number
      } | null
    }
  ],
  "page": number,
  "pageSize": number,
  "total": number
}
```

- `tipoDocumento` y `condicionIva` son los nombres de sus tablas, como `"DNI"` o `"Responsable Monotributo"`. Van como `string` y no como unión, porque los valores salen de la BD.
- `esConsumidorFinal` es `true` solo para el cliente predefinido del sistema ([ADR 0004](../adr/negocio/0004-cliente-consumidor-final-predefinido.md)).
- `cuentaCorriente` es `null` si el cliente no tiene cuenta corriente. `saldo` sale de la vista `v_saldo_cuenta_corriente` ([ADR 0005](../adr/negocio/0005-saldo-de-cuenta-corriente-calculado.md)): positivo si el cliente debe y negativo si tiene saldo a favor.

### Códigos HTTP

- **200 Ok**: devuelve la página, aunque no haya resultados.
- **400 Bad Request**: `page` o `pageSize` fuera de rango.
- **401 Unauthorized**: no hay una sesión válida.
