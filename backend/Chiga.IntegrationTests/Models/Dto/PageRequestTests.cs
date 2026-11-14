using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Chiga.IntegrationTests.Models.Dto;

// Endpoint que solo existe en los tests: todavía no hay listados reales que reciban PageRequest.
[ApiController]
public class PaginadoController : ControllerBase
{
  [HttpGet("/test-paginado")]
  public PageRequest Get([FromQuery] PageRequest pagination) => pagination;
}

public class PageRequestTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  private HttpClient CreateClient() => factory.WithWebHostBuilder(builder =>
    builder.ConfigureServices(services =>
      services.AddControllers().AddApplicationPart(typeof(PaginadoController).Assembly))
  ).CreateClient();

  [Fact]
  public async Task Get_WithoutParams_BindsDefaults()
  {
    var pagination = await CreateClient().GetFromJsonAsync<JsonElement>("/test-paginado");

    Assert.Equal(1, pagination.GetProperty("page").GetInt32());
    Assert.Equal(20, pagination.GetProperty("pageSize").GetInt32());
  }

  [Fact]
  public async Task Get_WithParams_BindsQueryValues()
  {
    var pagination = await CreateClient().GetFromJsonAsync<JsonElement>("/test-paginado?page=3&pageSize=500");

    Assert.Equal(3, pagination.GetProperty("page").GetInt32());
    Assert.Equal(500, pagination.GetProperty("pageSize").GetInt32());
  }

  [Theory]
  [InlineData("page=0", "Page")]
  [InlineData("pageSize=501", "PageSize")]
  [InlineData("page=abc", "Page")]
  public async Task Get_InvalidParam_ReturnsValidationProblemDetails400(string queryString, string errorKey)
  {
    var response = await CreateClient().GetAsync($"/test-paginado?{queryString}");

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
    Assert.True(problem.GetProperty("errors").TryGetProperty(errorKey, out _));
  }
}
