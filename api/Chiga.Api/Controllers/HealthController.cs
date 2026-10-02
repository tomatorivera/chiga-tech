using Microsoft.AspNetCore.Mvc;

namespace Controllers;

[ApiController]
[Route("[controller]")]
public class HealthController : ControllerBase {

  [HttpGet("/ping")]
  public ActionResult<string> Ping()
  {
    return Ok("pong");
  }

}