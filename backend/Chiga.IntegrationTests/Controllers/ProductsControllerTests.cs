using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Controllers;

// Necesita la BD levantada con migraciones y seeds (npm run db:reset).
// Inserta productos de prueba con prefijos propios (zztp, zzesc) y los borra al terminar.
[Collection("BD")]
public class ProductsControllerTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
  private const string Cleanup = """
    DELETE FROM codigo_barra WHERE codigo LIKE 'ZZTP-%' OR codigo LIKE 'ZZBC-%';
    DELETE FROM producto WHERE nombre LIKE 'zztp %' OR nombre LIKE 'zzesc %' OR nombre LIKE 'zzbc %';
    """;

  // zztp: Alfa con dos códigos, Beta inactivo y sin códigos, dos Gamma con el mismo nombre.
  // zzesc: pares en los que un comodín de LIKE sin escapar encontraría también al otro.
  // zzbc: inactivo con código, aparte para no alterar los resultados de las búsquedas por zztp.
  private const string Setup = """
    INSERT INTO producto (nombre, id_categoria, costo_unitario, precio_unitario, stock_minimo, stock_actual, estado, motivo_baja)
    SELECT v.nombre, c.id_categoria, 0, v.precio, 1, 5, v.estado, v.motivo
    FROM (VALUES
        ('zztp Alfa',   1000.50, true,  NULL),
        ('zztp Beta',   2000.00, false, 'Discontinuado'),
        ('zztp Gamma',  3000.00, true,  NULL),
        ('zztp Gamma',  3000.00, true,  NULL),
        ('zzesc 100%',  1.00,    true,  NULL),
        ('zzesc 1000',  1.00,    true,  NULL),
        ('zzesc a_b',   1.00,    true,  NULL),
        ('zzesc axb',   1.00,    true,  NULL),
        ('zzesc c\d',   1.00,    true,  NULL),
        ('zzesc cd',    1.00,    true,  NULL),
        ('zzbc Baja',   1.00,    false, 'Sin repuestos')
    ) AS v(nombre, precio, estado, motivo)
    CROSS JOIN categoria c
    WHERE c.nombre = 'CPUs';
    INSERT INTO codigo_barra (codigo, id_producto)
    SELECT v.codigo, p.id_producto
    FROM (VALUES ('ZZTP-1002', 'zztp Alfa'), ('ZZTP-1001', 'zztp Alfa'), ('ZZBC-0001', 'zzbc Baja'))
      AS v(codigo, producto)
    JOIN producto p ON p.nombre = v.producto;
    """;

  private NpgsqlDataSource DataSource => factory.Services.GetRequiredService<NpgsqlDataSource>();

  public async Task InitializeAsync()
  {
    await Execute(Cleanup);
    await Execute(Setup);
  }

  public async Task DisposeAsync() => await Execute(Cleanup);

  [Fact]
  public async Task GetAll_WithoutQuery_ReturnsWholeCatalogWithDefaultPagination()
  {
    var body = await GetProductos("");

    Assert.Equal(1, body.GetProperty("page").GetInt32());
    Assert.Equal(20, body.GetProperty("pageSize").GetInt32());
    Assert.Equal(await CountProductos(), body.GetProperty("total").GetInt32());
    Assert.Equal(Math.Min(20, await CountProductos()), body.GetProperty("data").GetArrayLength());
  }

  [Theory]
  [InlineData("query=")]
  [InlineData("query=%20%20%20")]
  public async Task GetAll_EmptyOrWhitespaceQuery_ReturnsWholeCatalog(string queryString)
  {
    var body = await GetProductos(queryString);

    Assert.Equal(await CountProductos(), body.GetProperty("total").GetInt32());
  }

  [Fact]
  public async Task GetAll_QueryByName_IsCaseInsensitiveAndTrimmed()
  {
    var body = await GetProductos("query=%20%20ZZTP%20ALFA%20%20");

    Assert.Equal(["zztp Alfa"], Nombres(body));
  }

  [Fact]
  public async Task GetAll_QueryByPartialBarcode_ReturnsProductOnceWithAllItsCodesOrdered()
  {
    var body = await GetProductos("query=zztp-100");

    var producto = Assert.Single(body.GetProperty("data").EnumerateArray());
    Assert.Equal("zztp Alfa", producto.GetProperty("nombre").GetString());
    Assert.Equal(["ZZTP-1001", "ZZTP-1002"], producto.GetProperty("codigosBarras").EnumerateArray().Select(c => c.GetString()));
  }

  [Fact]
  public async Task GetAll_SameName_OrdersByNameThenId()
  {
    var body = await GetProductos("query=zztp");

    Assert.Equal(["zztp Alfa", "zztp Beta", "zztp Gamma", "zztp Gamma"], Nombres(body));
    var gammaIds = body.GetProperty("data").EnumerateArray().Skip(2).Select(p => p.GetProperty("id").GetInt32()).ToList();
    Assert.True(gammaIds[0] < gammaIds[1]);
  }

  [Theory]
  [InlineData("zzesc 100%25", "zzesc 100%")]
  [InlineData("zzesc a_b", "zzesc a_b")]
  [InlineData(@"zzesc c\d", @"zzesc c\d")]
  public async Task GetAll_QueryWithLikeWildcards_MatchesThemLiterally(string query, string expected)
  {
    var body = await GetProductos($"query={query}");

    Assert.Equal([expected], Nombres(body));
  }

  [Fact]
  public async Task GetAll_SecondPage_ReturnsRemainingItemsAndTotalOfAllMatches()
  {
    var all = Nombres(await GetProductos("query=zztp"));

    var body = await GetProductos("query=zztp&page=2&pageSize=3");

    Assert.Equal(2, body.GetProperty("page").GetInt32());
    Assert.Equal(3, body.GetProperty("pageSize").GetInt32());
    Assert.Equal(4, body.GetProperty("total").GetInt32());
    Assert.Equal(all.Skip(3), Nombres(body));
  }

  [Fact]
  public async Task GetAll_PageAfterLast_ReturnsEmptyDataWithTotal()
  {
    var body = await GetProductos("query=zztp&page=3&pageSize=3");

    Assert.Equal(0, body.GetProperty("data").GetArrayLength());
    Assert.Equal(4, body.GetProperty("total").GetInt32());
  }

  [Fact]
  public async Task GetAll_NoMatches_ReturnsOkWithEmptyData()
  {
    var body = await GetProductos("query=zz-no-existe-zz");

    Assert.Equal(0, body.GetProperty("data").GetArrayLength());
    Assert.Equal(0, body.GetProperty("total").GetInt32());
  }

  [Fact]
  public async Task GetAll_InactiveProduct_BodyHasExactlyTheContractFields()
  {
    var body = await GetProductos("query=zztp beta");

    Assert.Equal(["data", "page", "pageSize", "total"], body.EnumerateObject().Select(p => p.Name).Order());
    var producto = Assert.Single(body.GetProperty("data").EnumerateArray());
    Assert.Equal(
      ["categoria", "codigosBarras", "estado", "id", "motivoBaja", "nombre", "precioUnitario", "stockActual", "stockMinimo"],
      producto.EnumerateObject().Select(p => p.Name).Order());
    Assert.Equal("CPUs", producto.GetProperty("categoria").GetString());
    Assert.Equal(0, producto.GetProperty("codigosBarras").GetArrayLength());
    Assert.Equal(2000m, producto.GetProperty("precioUnitario").GetDecimal());
    Assert.Equal(5, producto.GetProperty("stockActual").GetInt32());
    Assert.Equal(1, producto.GetProperty("stockMinimo").GetInt32());
    Assert.Equal("INACTIVO", producto.GetProperty("estado").GetString());
    Assert.Equal("Discontinuado", producto.GetProperty("motivoBaja").GetString());
  }

  [Fact]
  public async Task GetAll_ActiveProduct_ReturnsActivoWithNullMotivoBaja()
  {
    var body = await GetProductos("query=zztp alfa");

    var producto = Assert.Single(body.GetProperty("data").EnumerateArray());
    Assert.Equal("ACTIVO", producto.GetProperty("estado").GetString());
    Assert.Equal(JsonValueKind.Null, producto.GetProperty("motivoBaja").ValueKind);
    Assert.Equal(1000.50m, producto.GetProperty("precioUnitario").GetDecimal());
  }

  [Theory]
  [InlineData("ZZTP-1001")]
  [InlineData("ZZTP-1002")]
  public async Task GetByBarcode_AnyOfItsCodes_ReturnsProductWithAllCodes(string codigo)
  {
    var response = await Get($"/productos/codigo/{codigo}");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var producto = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal("zztp Alfa", producto.GetProperty("nombre").GetString());
    Assert.Equal(["ZZTP-1001", "ZZTP-1002"], producto.GetProperty("codigosBarras").EnumerateArray().Select(c => c.GetString()));
  }

  [Fact]
  public async Task GetByBarcode_InactiveProduct_ReturnsItWithMotivoBaja()
  {
    var response = await Get("/productos/codigo/ZZBC-0001");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    var producto = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal("INACTIVO", producto.GetProperty("estado").GetString());
    Assert.Equal("Sin repuestos", producto.GetProperty("motivoBaja").GetString());
  }

  [Fact]
  public async Task GetByBarcode_CodeWithSurroundingSpaces_ReturnsProduct()
  {
    var response = await Get("/productos/codigo/%20ZZTP-1001%20");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Theory]
  [InlineData("ZZTP-100")]   // parte de un código existente
  [InlineData("ZZTP-1001X")] // un código existente con algo más
  [InlineData("zztp-1001")]  // coincidencia exacta: distingue mayúsculas
  [InlineData("ZZTP-100_")]  // un comodín de LIKE no se interpreta
  public async Task GetByBarcode_NoExactMatch_ReturnsNotFoundProblem(string codigo)
  {
    var response = await Get($"/productos/codigo/{codigo}");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal(404, problem.GetProperty("status").GetInt32());
  }

  private async Task<JsonElement> GetProductos(string queryString)
  {
    var response = await Get($"/productos?{queryString}");

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return await response.Content.ReadFromJsonAsync<JsonElement>();
  }

  private async Task<HttpResponseMessage> Get(string url)
  {
    var client = factory.CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var cookie = login.Headers.GetValues("Set-Cookie").Single().Split(';')[0];

    var request = new HttpRequestMessage(HttpMethod.Get, url);
    request.Headers.Add("Cookie", cookie);
    return await client.SendAsync(request);
  }

  private static List<string?> Nombres(JsonElement body) =>
    [.. body.GetProperty("data").EnumerateArray().Select(p => p.GetProperty("nombre").GetString())];

  private async Task<int> CountProductos()
  {
    await using var cmd = DataSource.CreateCommand("SELECT count(*) FROM producto");
    return (int)(long)(await cmd.ExecuteScalarAsync())!;
  }

  private async Task Execute(string sql)
  {
    await using var cmd = DataSource.CreateCommand(sql);
    await cmd.ExecuteNonQueryAsync();
  }
}
