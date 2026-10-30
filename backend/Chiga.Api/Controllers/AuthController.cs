using System.Security.Claims;
using Api.Exceptions;
using Api.Models.Dto;
using Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
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

  // [Authorize]: si no hay cookie, o es falsa o está vencida, responde 401 sin entrar al método
  [Authorize]
  [HttpGet("me")]
  public async Task<ActionResult<UsuarioDTO>> Me(CancellationToken ct = default)
  {
    // Al iniciar sesión se guardó el id del usuario dentro de la cookie (ver BuildIdentity)
    var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var id = int.Parse(idClaim);

    var user = await authService.GetSessionUserAsync(id, ct);

    // La cookie es válida, pero el usuario ya no existe o fue dado de baja
    if (user is null)
    {
      return Problem(
        statusCode: StatusCodes.Status401Unauthorized,
        title: "No autorizado",
        detail: "La sesión ya no es válida."
      );
    }

    return Ok(user);
  }

  // No requiere sesión: borra la cookie aunque no exista (contrato 0001)
  [HttpPost("logout")]
  public async Task<IActionResult> Logout()
  {
    await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    return NoContent();
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