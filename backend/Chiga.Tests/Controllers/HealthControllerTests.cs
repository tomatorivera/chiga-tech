using Microsoft.AspNetCore.Mvc;
using Controllers;

namespace Chiga.Tests.Controllers;

public class HealthControllerTests
{
  [Fact]
  public void Ping_ReturnsOkWithPong()
  {
    var controller = new HealthController();

    var result = controller.Ping();

    var ok = Assert.IsType<OkObjectResult>(result.Result);
    Assert.Equal("pong", ok.Value);
  }
}
