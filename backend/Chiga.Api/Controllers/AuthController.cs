using Api.Exceptions;
using Api.Models.Dto;
using Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
  [HttpPost("login")]
  public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginRequestDTO req, CancellationToken ct = default)
  {
    try
    {
      var user = await authService.LoginAsync(req, ct);
      return Ok(user);
    }
    catch (Exception ex) when (ex is InvalidCredentialsException or DisabledUserException)
    {
      return Problem(
        statusCode: StatusCodes.Status401Unauthorized, 
        title: "No autorizado", 
        detail: ex.Message
      );
    }
  }
}