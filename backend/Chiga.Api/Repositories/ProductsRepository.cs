using Api.Models.Dto;
using Api.Models.Entities;
using Npgsql;

namespace Api.Repositories;

public class ProductsRepository(NpgsqlDataSource ds) : IProductsRepository
{
  public async Task<PagedResponse<Producto>> FindAll(
    string? query, PageRequest page, CancellationToken ct = default
  )
  {
    var searchFilter = """
    (p.nombre ILIKE @pattern
     OR EXISTS (SELECT 1 FROM codigo_barra cb
                WHERE cb.id_producto = p.id_producto AND cb.codigo ILIKE @pattern))
    """;
    var where = query is null ? "TRUE" : searchFilter;
    var pageSql = $"""
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio_unitario, p.stock_minimo,
             p.stock_actual, p.imagen, p.estado, p.motivo_baja, p.observacion,
             c.id_categoria, c.nombre, c.descripcion, c.estado,
             u.sector, u.estante,
             COALESCE((SELECT array_agg(cb.codigo ORDER BY cb.codigo)
                       FROM codigo_barra cb WHERE cb.id_producto = p.id_producto), ARRAY[]::varchar[])
      FROM (
        SELECT * FROM producto p
        WHERE {where}
        ORDER BY p.nombre, p.id_producto
        LIMIT @limit OFFSET @offset
      ) p
      JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN ubicacion u ON u.id_ubicacion = p.id_ubicacion
      ORDER BY p.nombre, p.id_producto
      """;

    var countSql = $"SELECT count(*) FROM producto p WHERE {where}";

    // Como hay que hacer dos consultas (count y select de productos)
    // lo hago dentro de un batch para que se manden juntas a la BD
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
    var productos = new List<Producto>();

    while (await reader.ReadAsync(ct))
      productos.Add(ToProduct(reader));

    return new PagedResponse<Producto>(productos, page.Page, page.PageSize, total);
  }

  public async Task<Producto?> FindByCodigo(string codigo, CancellationToken ct = default)
  {
    await using var cmd = ds.CreateCommand("""
      SELECT p.id_producto, p.nombre, p.descripcion, p.precio_unitario, p.stock_minimo,
             p.stock_actual, p.imagen, p.estado, p.motivo_baja, p.observacion,
             c.id_categoria, c.nombre, c.descripcion, c.estado,
             u.sector, u.estante,
             ARRAY(SELECT cb2.codigo FROM codigo_barra cb2
                   WHERE cb2.id_producto = p.id_producto ORDER BY cb2.codigo)
      FROM codigo_barra cb
      JOIN producto p ON p.id_producto = cb.id_producto
      JOIN categoria c ON c.id_categoria = p.id_categoria
      LEFT JOIN ubicacion u ON u.id_ubicacion = p.id_ubicacion
      WHERE cb.codigo = @codigo
      """);
    cmd.Parameters.AddWithValue("codigo", codigo);

    await using var reader = await cmd.ExecuteReaderAsync(ct);
    return await reader.ReadAsync(ct) ? ToProduct(reader) : null;
  }

  private static Producto ToProduct(NpgsqlDataReader reader) => new(
    Id: reader.GetInt32(0),
    Nombre: reader.GetString(1),
    Descripcion: reader.IsDBNull(2) ? null : reader.GetString(2),
    Categoria: new Categoria(
      reader.GetInt32(10),
      reader.GetString(11),
      reader.IsDBNull(12) ? null : reader.GetString(12),
      null,
      reader.GetBoolean(13)
    ),
    Ubicacion: reader.IsDBNull(14) ? null : new Ubicacion(
      reader.GetString(14),
      reader.GetString(15)
    ),
    Precio: reader.GetDecimal(3),
    StockMinimo: reader.GetInt32(4),
    StockActual: reader.GetInt32(5),
    Imagen: reader.IsDBNull(6) ? null : reader.GetString(6),
    EstaActivo: reader.GetBoolean(7),
    MotivoBaja: reader.IsDBNull(8) ? null : reader.GetString(8),
    Observacion: reader.IsDBNull(9) ? null : reader.GetString(9),
    CodigosBarra: [.. reader.GetFieldValue<string[]>(16)]
  );
}
