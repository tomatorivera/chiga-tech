using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase {

  [HttpGet("/ping")]
  public ActionResult<string> Ping()
  {
    return Ok("pong");
  }

}