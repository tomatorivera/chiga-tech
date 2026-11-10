using System.Net;
using System.Net.Http.Json;
using Api.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Chiga.IntegrationTests.Constants;

// Endpoints que solo existen en los tests, uno por rol mínimo.
[ApiController]
public class MinimumRoleTestController : ControllerBase
{
  [Authorize(Roles = MinimumRole.Supervisor)]
  [HttpGet("/test-minimo-supervisor")]
  public IActionResult Supervisor() => Ok();

  [Authorize(Roles = MinimumRole.Administrador)]
  [HttpGet("/test-minimo-administrador")]
  public IActionResult Administrador() => Ok();

  [Authorize(Roles = MinimumRole.Dueño)]
  [HttpGet("/test-minimo-dueno")]
  public IActionResult Dueño() => Ok();
}

// Necesita la BD levantada con migraciones y seeds (npm run db:reset).
public class MinimumRoleTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  private HttpClient CreateClient() => factory.WithWebHostBuilder(builder =>
    builder.ConfigureServices(services =>
      services.AddControllers().AddApplicationPart(typeof(MinimumRoleTestController).Assembly))
  ).CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });

  [Theory]
  [InlineData("vendedor", "/test-minimo-supervisor", HttpStatusCode.Forbidden)]
  [InlineData("supervisor", "/test-minimo-supervisor", HttpStatusCode.OK)]
  [InlineData("admin", "/test-minimo-supervisor", HttpStatusCode.OK)]
  [InlineData("dueno", "/test-minimo-supervisor", HttpStatusCode.OK)]
  [InlineData("multirol", "/test-minimo-supervisor", HttpStatusCode.OK)]
  [InlineData("vendedor", "/test-minimo-administrador", HttpStatusCode.Forbidden)]
  [InlineData("supervisor", "/test-minimo-administrador", HttpStatusCode.Forbidden)]
  [InlineData("admin", "/test-minimo-administrador", HttpStatusCode.OK)]
  [InlineData("dueno", "/test-minimo-administrador", HttpStatusCode.OK)]
  [InlineData("multirol", "/test-minimo-administrador", HttpStatusCode.Forbidden)]
  [InlineData("vendedor", "/test-minimo-dueno", HttpStatusCode.Forbidden)]
  [InlineData("supervisor", "/test-minimo-dueno", HttpStatusCode.Forbidden)]
  [InlineData("admin", "/test-minimo-dueno", HttpStatusCode.Forbidden)]
  [InlineData("dueno", "/test-minimo-dueno", HttpStatusCode.OK)]
  [InlineData("multirol", "/test-minimo-dueno", HttpStatusCode.Forbidden)]
  public async Task MinimumRole_UserRoles_ReturnsExpectedStatus(string username, string url, HttpStatusCode expected)
  {
    var client = CreateClient();
    var login = await client.PostAsJsonAsync("/auth/login", new { username, password = "chiga1234" });
    var sessionCookie = login.Headers.GetValues("Set-Cookie").Single().Split(';')[0];

    var request = new HttpRequestMessage(HttpMethod.Get, url);
    request.Headers.Add("Cookie", sessionCookie);
    var response = await client.SendAsync(request);

    Assert.Equal(expected, response.StatusCode);
  }
}
