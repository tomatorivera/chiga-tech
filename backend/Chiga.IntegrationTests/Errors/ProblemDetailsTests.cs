using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Chiga.IntegrationTests.Errors;

[ApiController]
public class BoomController : ControllerBase
{
  [HttpGet("/test-boom")]
  public IActionResult Boom() => throw new InvalidOperationException("secreto interno");
}

public class ProblemDetailsTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  // Production: ahí no se debe filtrar el detalle de la excepción.
  private HttpClient CreateClient() => factory.WithWebHostBuilder(builder =>
  {
    builder.UseEnvironment("Production");
    builder.ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(
      new Dictionary<string, string?> { ["ConnectionStrings:Default"] = "Host=localhost" }));
    builder.ConfigureServices(services =>
      services.AddControllers().AddApplicationPart(typeof(BoomController).Assembly));
  }).CreateClient();

  [Fact]
  public async Task UnknownRoute_ReturnsProblemDetails404()
  {
    var response = await CreateClient().GetAsync("/no-existe");

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.Equal(404, problem.GetProperty("status").GetInt32());
  }

  [Fact]
  public async Task UnhandledException_ReturnsProblemDetails500WithoutStackTrace()
  {
    var response = await CreateClient().GetAsync("/test-boom");

    Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var body = await response.Content.ReadAsStringAsync();
    Assert.Equal(500, JsonDocument.Parse(body).RootElement.GetProperty("status").GetInt32());
    Assert.DoesNotContain("secreto interno", body);
    Assert.DoesNotContain("at Chiga", body);
  }
}
