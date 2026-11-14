using Api.Models.Dto;
using Api.Models.Entities;
using Npgsql;

namespace Api.Repositories;

public class ClientsRepository(NpgsqlDataSource ds) : IClientsRepository
{
  public async Task<PagedResponse<Cliente>> FindAll(
    string? query, PageRequest page, CancellationToken ct
  )
  {
    var where = query is null
      ? "TRUE"
      : "(c.nombre_razon_social ILIKE @pattern OR c.nro_documento ILIKE @pattern)";

    var pageSql = $"""
      SELECT c.id_cliente, tp.nombre, c.nombre_razon_social, td.nombre, c.nro_documento, ci.nombre,
             c.domicilio_facturacion, c.telefono, c.correo, c.es_sistema, c.estado,
             c.motivo_baja, c.observacion, cc.limite_credito,
             (SELECT v.saldo FROM v_saldo_cuenta_corriente v
              WHERE v.id_cuenta_corriente = cc.id_cuenta_corriente)
      FROM (
        SELECT * FROM cliente c
        WHERE {where}
        ORDER BY c.nombre_razon_social, c.id_cliente
        LIMIT @limit OFFSET @offset
      ) c
      JOIN tipo_persona tp ON tp.id_tipo_persona = c.id_tipo_persona
      JOIN tipo_documento td ON td.id_tipo_documento = c.id_tipo_documento
      JOIN condicion_iva ci ON ci.id_condicion_iva = c.id_condicion_iva
      LEFT JOIN cuenta_corriente cc ON cc.id_cliente = c.id_cliente
      ORDER BY c.nombre_razon_social, c.id_cliente
      """;

    var countSql = $"SELECT count(*) FROM cliente c WHERE {where}";

    await using var batch = ds.CreateBatch();

    var countCmd = batch.CreateBatchCommand();
    countCmd.CommandText = countSql;

    var listCmd = batch.CreateBatchCommand();
    listCmd.CommandText = pageSql;
    listCmd.Parameters.AddWithValue("limit", page.PageSize);
    listCmd.Parameters.AddWithValue("offset", (long)(page.Page - 1) * page.PageSize);

    if (query is not null)
    {
      countCmd.Parameters.AddWithValue("pattern", $"%{query}%");
      listCmd.Parameters.AddWithValue("pattern", $"%{query}%");
    }

    batch.BatchCommands.Add(countCmd);
    batch.BatchCommands.Add(listCmd);

    await using var reader = await batch.ExecuteReaderAsync(ct);

    await reader.ReadAsync(ct);
    var total = (int)reader.GetInt64(0);
    await reader.NextResultAsync(ct);

    var clientes = new List<Cliente>();
    while (await reader.ReadAsync(ct))
      clientes.Add(ToCliente(reader));

    return new PagedResponse<Cliente>(clientes, page.Page, page.PageSize, total);
  }

  private static Cliente ToCliente(NpgsqlDataReader reader) => new(
    Id: reader.GetInt32(0),
    TipoPersona: ToTipoPersona(reader.GetString(1)),
    NombreRazonSocial: reader.GetString(2),
    TipoDocumento: reader.GetString(3),
    NroDocumento: reader.GetString(4),
    CondicionIva: reader.GetString(5),
    DomicilioFacturacion: reader.IsDBNull(6) ? null : reader.GetString(6),
    Telefono: reader.IsDBNull(7) ? null : reader.GetString(7),
    Correo: reader.IsDBNull(8) ? null : reader.GetString(8),
    EsSistema: reader.GetBoolean(9),
    EstaActivo: reader.GetBoolean(10),
    MotivoBaja: reader.IsDBNull(11) ? null : reader.GetString(11),
    Observacion: reader.IsDBNull(12) ? null : reader.GetString(12),
    CuentaCorriente: reader.IsDBNull(13) ? null : new CuentaCorriente(
      reader.GetDecimal(13),
      reader.GetDecimal(14)
    )
  );

  private static TipoPersona ToTipoPersona(string nombre) => nombre switch
  {
    "Física" => TipoPersona.FISICA,
    "Jurídica" => TipoPersona.JURIDICA,
    _ => throw new InvalidOperationException($"Tipo de persona desconocido: {nombre}"),
  };
}
