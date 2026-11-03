using Microsoft.AspNetCore.Mvc.Testing;

namespace Chiga.IntegrationTests.Controllers;

public class HealthControllerTests(WebApplicationFactory<Program> factory)
  : IClassFixture<WebApplicationFactory<Program>>
{
  [Fact]
  public async Task Ping_ReturnsPong()
  {
    var client = factory.CreateClient();

    var response = await client.GetAsync("/ping");

    response.EnsureSuccessStatusCode();
    Assert.Equal("pong", await response.Content.ReadAsStringAsync());
  }
}
