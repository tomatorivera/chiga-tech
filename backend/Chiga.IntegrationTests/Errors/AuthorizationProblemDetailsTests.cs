using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace Chiga.IntegrationTests.Errors;

// Endpoint que solo existe en los tests: todavía no hay endpoints reales protegidos por rol.
[ApiController]
public class SoloDuenoController : ControllerBase
{
  [Authorize(Roles = "Dueño")]
  [HttpGet("/test-solo-dueno")]
  public IActionResult Get() => Ok();
}

// Endpoint que solo existe en los tests: pide sesión, sin rol, y no valida al usuario por su cuenta como /auth/me.
[ApiController]
public class ConSesionController : ControllerBase
{
  [Authorize]
  [HttpGet("/test-con-sesion")]
  public IActionResult Get() => Ok();
}

// Necesita la BD levantada con migraciones y seeds (npm run db:reset).
// Sin sesión o sin permiso, la API responde 401 o 403 con ProblemDetails, nunca redirige a una página de login.
public class AuthorizationProblemDetailsTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  private HttpClient CreateClient() => factory.WithWebHostBuilder(builder =>
    builder.ConfigureServices(services =>
      services.AddControllers().AddApplicationPart(typeof(SoloDuenoController).Assembly))
  ).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

  [Fact]
  public async Task ProtectedEndpoint_WithoutSession_ReturnsUnauthorizedProblemDetails()
  {
    var response = await CreateClient().GetAsync("/test-solo-dueno");

    await AssertProblemDetails(response, HttpStatusCode.Unauthorized);
  }

  [Fact]
  public async Task ProtectedEndpoint_SessionWithoutRequiredRole_ReturnsForbiddenProblemDetails()
  {
    var client = CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username = "vendedor", password = "chiga1234" });
    var sessionCookie = login.Headers.GetValues("Set-Cookie").Single().Split(';')[0];

    var request = new HttpRequestMessage(HttpMethod.Get, "/test-solo-dueno");
    request.Headers.Add("Cookie", sessionCookie);
    var response = await client.SendAsync(request);

    await AssertProblemDetails(response, HttpStatusCode.Forbidden);
  }

  [Fact]
  public async Task ProtectedEndpoint_SessionWithoutRequiredRole_KeepsSessionCookie()
  {
    var client = CreateClient();
    var sessionCookie = await Login(client, "vendedor");

    var response = await Get(client, "/test-solo-dueno", sessionCookie);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    Assert.False(response.Headers.Contains("Set-Cookie"));
  }

  [Fact]
  public async Task ProtectedEndpoint_SessionWithRequiredRole_ReturnsOk()
  {
    var client = CreateClient();
    var sessionCookie = await Login(client, "dueno");

    var response = await Get(client, "/test-solo-dueno", sessionCookie);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task ProtectedEndpoint_UserDisabledWhileSessionOpen_KeepsAccess()
  {
    // Usuario propio del test: dar de baja a uno de los seeds rompería los demás tests
    var dataSource = factory.Services.GetRequiredService<NpgsqlDataSource>();
    var hash = BCrypt.Net.BCrypt.HashPassword("chiga1234", workFactor: 4);
    await ExecuteSql(dataSource, "DELETE FROM usuario WHERE nombre_usuario = 'test_baja_endpoint'");
    await ExecuteSql(dataSource, "INSERT INTO usuario (nombre_usuario, nombre, apellido, contrasena) VALUES ('test_baja_endpoint', 'Test', 'Baja', @hash)", hash);

    try
    {
      var client = CreateClient();
      var sessionCookie = await Login(client, "test_baja_endpoint");
      Assert.Equal(HttpStatusCode.OK, (await Get(client, "/test-con-sesion", sessionCookie)).StatusCode);

      await ExecuteSql(dataSource, "UPDATE usuario SET estado = false WHERE nombre_usuario = 'test_baja_endpoint'");
      var response = await Get(client, "/test-con-sesion", sessionCookie);

      Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
    finally
    {
      await ExecuteSql(dataSource, "DELETE FROM usuario WHERE nombre_usuario = 'test_baja_endpoint'");
    }
  }

  private static async Task<string> Login(HttpClient client, string username)
  {
    var login = await client.PostAsJsonAsync("/auth/login", new { username, password = "chiga1234" });
    return login.Headers.GetValues("Set-Cookie").Single().Split(';')[0];
  }

  private static Task<HttpResponseMessage> Get(HttpClient client, string url, string cookie)
  {
    var request = new HttpRequestMessage(HttpMethod.Get, url);
    request.Headers.Add("Cookie", cookie);
    return client.SendAsync(request);
  }

  private static async Task ExecuteSql(NpgsqlDataSource dataSource, string sql, string? hash = null)
  {
    await using var cmd = dataSource.CreateCommand(sql);
    if (hash is not null) cmd.Parameters.AddWithValue("hash", hash);
    await cmd.ExecuteNonQueryAsync();
  }

  private static async Task AssertProblemDetails(HttpResponseMessage response, HttpStatusCode expected)
  {
    Assert.Equal(expected, response.StatusCode);
    Assert.Null(response.Headers.Location);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal((int)expected, problem.GetProperty("status").GetInt32());
  }
}
