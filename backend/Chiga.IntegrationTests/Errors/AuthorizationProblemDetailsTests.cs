using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Chiga.IntegrationTests.Errors;

// Endpoint que solo existe en los tests: todavía no hay endpoints reales protegidos por rol.
[ApiController]
public class SoloDuenoController : ControllerBase
{
  [Authorize(Roles = "Dueño")]
  [HttpGet("/test-solo-dueno")]
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

  private static async Task AssertProblemDetails(HttpResponseMessage response, HttpStatusCode expected)
  {
    Assert.Equal(expected, response.StatusCode);
    Assert.Null(response.Headers.Location);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal((int)expected, problem.GetProperty("status").GetInt32());
  }
}
