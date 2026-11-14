using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Controllers;

// Necesita la BD levantada con migraciones y seeds (npm run db:reset).
// Inserta clientes de prueba con el prefijo "zzcl" y los borra al terminar.
[Collection("BD")]
public class ClientsControllerTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>, IAsyncLifetime
{
  private const string Cleanup = """
    DELETE FROM movimiento_cuenta_corriente m USING cuenta_corriente cc, cliente c
    WHERE m.id_cuenta_corriente = cc.id_cuenta_corriente AND cc.id_cliente = c.id_cliente
      AND c.nombre_razon_social LIKE 'zzcl %';
    DELETE FROM cuenta_corriente cc USING cliente c
    WHERE cc.id_cliente = c.id_cliente AND c.nombre_razon_social LIKE 'zzcl %';
    DELETE FROM cliente WHERE nombre_razon_social LIKE 'zzcl %';
    """;

  // Alfa: debe 700 (factura de 1000, recibo de 300). Delta: cuenta sin movimientos.
  // Epsilon: saldo a favor de 200. Beta: inactivo y sin cuenta. Dos Gamma para el desempate por id.
  // Los pares 100%/1000 y a_b/axb se encontrarían entre sí si los comodines de LIKE no se escaparan.
  private const string Setup = """
    INSERT INTO cliente (id_tipo_persona, nombre_razon_social, id_tipo_documento, nro_documento,
                         id_condicion_iva, estado, motivo_baja)
    SELECT tp.id_tipo_persona, v.nombre, td.id_tipo_documento, v.nro, ci.id_condicion_iva, v.estado, v.motivo
    FROM (VALUES
        ('Jurídica', 'zzcl Alfa SRL', 'CUIT', '20998877663', 'IVA Responsable Inscripto', true,  NULL),
        ('Física',   'zzcl Beta',     'DNI',  '91000001',    'Consumidor Final',          false, 'Se mudó'),
        ('Física',   'zzcl Delta',    'DNI',  '91000002',    'Responsable Monotributo',   true,  NULL),
        ('Física',   'zzcl Epsilon',  'DNI',  '91000003',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl Gamma',    'DNI',  '91000004',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl Gamma',    'DNI',  '91000005',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl 100%',     'DNI',  '91000006',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl 1000',     'DNI',  '91000007',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl a_b',      'DNI',  '91000008',    'Consumidor Final',          true,  NULL),
        ('Física',   'zzcl axb',      'DNI',  '91000009',    'Consumidor Final',          true,  NULL)
    ) AS v(tipo_persona, nombre, tipo_documento, nro, condicion_iva, estado, motivo)
    JOIN tipo_persona tp ON tp.nombre = v.tipo_persona
    JOIN tipo_documento td ON td.nombre = v.tipo_documento
    JOIN condicion_iva ci ON ci.nombre = v.condicion_iva;
    INSERT INTO cuenta_corriente (id_cliente, limite_credito)
    SELECT c.id_cliente, v.limite
    FROM (VALUES ('zzcl Alfa SRL', 5000.00), ('zzcl Delta', 1000.00), ('zzcl Epsilon', 0.00)) AS v(nombre, limite)
    JOIN cliente c ON c.nombre_razon_social = v.nombre;
    INSERT INTO movimiento_cuenta_corriente (id_cuenta_corriente, id_usuario, tipo_movimiento, sentido, importe)
    SELECT cc.id_cuenta_corriente, u.id_usuario, v.tipo, v.sentido, v.importe
    FROM (VALUES
        ('zzcl Alfa SRL', 'FACTURA', 'DEBITO',  1000.00),
        ('zzcl Alfa SRL', 'RECIBO',  'CREDITO', 300.00),
        ('zzcl Epsilon',  'RECIBO',  'CREDITO', 200.00)
    ) AS v(nombre, tipo, sentido, importe)
    JOIN cliente c ON c.nombre_razon_social = v.nombre
    JOIN cuenta_corriente cc ON cc.id_cliente = c.id_cliente
    CROSS JOIN usuario u
    WHERE u.nombre_usuario = 'vendedor';
    """;

  private NpgsqlDataSource DataSource => factory.Services.GetRequiredService<NpgsqlDataSource>();

  public async Task InitializeAsync()
  {
    await Execute(Cleanup);
    await Execute(Setup);
  }

  public async Task DisposeAsync() => await Execute(Cleanup);

  [Theory]
  [InlineData("")]
  [InlineData("query=%20%20%20")]
  public async Task GetAll_WithoutQueryOrBlank_ReturnsAllClients(string queryString)
  {
    var body = await GetClientes(queryString);

    Assert.Equal(await CountClientes(), body.GetProperty("total").GetInt32());
    Assert.Equal(Math.Min(20, await CountClientes()), body.GetProperty("data").GetArrayLength());
  }

  [Fact]
  public async Task GetAll_QueryByName_IsCaseInsensitiveAndTrimmed()
  {
    var body = await GetClientes("query=%20%20ZZCL%20DELTA%20%20");

    Assert.Equal(["zzcl Delta"], Nombres(body));
  }

  [Fact]
  public async Task GetAll_DniInsideCuit_FindsClientByPartialDocument()
  {
    var body = await GetClientes("query=99887766");

    Assert.Equal(["zzcl Alfa SRL"], Nombres(body));
  }

  [Fact]
  public async Task GetAll_SameName_OrdersByNameThenId()
  {
    var body = await GetClientes("query=zzcl gamma");

    var ids = body.GetProperty("data").EnumerateArray().Select(c => c.GetProperty("id").GetInt32()).ToList();
    Assert.Equal(2, ids.Count);
    Assert.True(ids[0] < ids[1]);
  }

  [Theory]
  [InlineData("zzcl 100%25", "zzcl 100%")]
  [InlineData("zzcl a_b", "zzcl a_b")]
  public async Task GetAll_QueryWithLikeWildcards_MatchesThemLiterally(string query, string expected)
  {
    var body = await GetClientes($"query={query}");

    Assert.Equal([expected], Nombres(body));
  }

  [Fact]
  public async Task GetAll_NoMatches_ReturnsOkWithEmptyData()
  {
    var body = await GetClientes("query=zz-no-existe-zz");

    Assert.Equal(0, body.GetProperty("data").GetArrayLength());
    Assert.Equal(0, body.GetProperty("total").GetInt32());
  }

  [Fact]
  public async Task GetAll_ClientWithCuentaCorriente_BodyHasExactlyTheContractFields()
  {
    var body = await GetClientes("query=zzcl alfa");

    var cliente = Assert.Single(body.GetProperty("data").EnumerateArray());
    Assert.Equal(
      ["condicionIva", "cuentaCorriente", "esConsumidorFinal", "estado", "id", "motivoBaja",
       "nombreRazonSocial", "nroDocumento", "tipoDocumento"],
      cliente.EnumerateObject().Select(p => p.Name).Order());
    Assert.Equal("CUIT", cliente.GetProperty("tipoDocumento").GetString());
    Assert.Equal("20998877663", cliente.GetProperty("nroDocumento").GetString());
    Assert.Equal("IVA Responsable Inscripto", cliente.GetProperty("condicionIva").GetString());
    Assert.Equal("ACTIVO", cliente.GetProperty("estado").GetString());
    Assert.Equal(JsonValueKind.Null, cliente.GetProperty("motivoBaja").ValueKind);
    Assert.False(cliente.GetProperty("esConsumidorFinal").GetBoolean());

    var cuenta = cliente.GetProperty("cuentaCorriente");
    Assert.Equal(["limiteCredito", "saldo"], cuenta.EnumerateObject().Select(p => p.Name).Order());
    Assert.Equal(5000m, cuenta.GetProperty("limiteCredito").GetDecimal());
    Assert.Equal(700m, cuenta.GetProperty("saldo").GetDecimal());
  }

  [Theory]
  [InlineData("zzcl delta", 0)]      // cuenta sin movimientos
  [InlineData("zzcl epsilon", -200)] // saldo a favor del cliente
  public async Task GetAll_CuentaCorrienteEdgeBalances_ReturnsSaldoFromView(string query, int saldo)
  {
    var body = await GetClientes($"query={query}");

    var cuenta = Assert.Single(body.GetProperty("data").EnumerateArray()).GetProperty("cuentaCorriente");
    Assert.Equal(saldo, cuenta.GetProperty("saldo").GetDecimal());
  }

  [Fact]
  public async Task GetAll_InactiveClientWithoutCuentaCorriente_ReturnsInactivoWithMotivoAndNullCuenta()
  {
    var body = await GetClientes("query=zzcl beta");

    var cliente = Assert.Single(body.GetProperty("data").EnumerateArray());
    Assert.Equal("INACTIVO", cliente.GetProperty("estado").GetString());
    Assert.Equal("Se mudó", cliente.GetProperty("motivoBaja").GetString());
    Assert.Equal(JsonValueKind.Null, cliente.GetProperty("cuentaCorriente").ValueKind);
  }

  [Fact]
  public async Task GetAll_ConsumidorFinal_IsTheOnlyClientMarkedAsConsumidorFinal()
  {
    var body = await GetClientes("pageSize=500");

    var marcados = body.GetProperty("data").EnumerateArray()
      .Where(c => c.GetProperty("esConsumidorFinal").GetBoolean())
      .Select(c => c.GetProperty("nombreRazonSocial").GetString());
    Assert.Equal(["Consumidor Final"], marcados);
  }

  private async Task<JsonElement> GetClientes(string queryString)
  {
    var response = await Get($"/clientes?{queryString}");

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
    [.. body.GetProperty("data").EnumerateArray().Select(c => c.GetProperty("nombreRazonSocial").GetString())];

  private async Task<int> CountClientes()
  {
    await using var cmd = DataSource.CreateCommand("SELECT count(*) FROM cliente");
    return (int)(long)(await cmd.ExecuteScalarAsync())!;
  }

  private async Task Execute(string sql)
  {
    await using var cmd = DataSource.CreateCommand(sql);
    await cmd.ExecuteNonQueryAsync();
  }
}
