using System.Security.Claims;
using Api.Exceptions;
using Api.Models.Dto;
using Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
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

      await HttpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(BuildIdentity(user)));
        
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

  private static ClaimsIdentity BuildIdentity(UsuarioDTO user)
  {
    var claims = new List<Claim>
    {
      new(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new(ClaimTypes.Name, user.NombreUsuario),
    };
    claims.AddRange(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)));
    claims.AddRange(user.Permisos.Select(p => new Claim("permiso", p)));

    return new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
  }
}