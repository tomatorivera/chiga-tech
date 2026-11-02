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
public class AuthController(IAuthService authService, ActiveSessions sessions) : ControllerBase
{
  [HttpPost("login")]
  public async Task<ActionResult<UsuarioDTO>> Login([FromBody] LoginRequestDTO req, CancellationToken ct = default)
  {
    try
    {
      var user = await authService.LoginAsync(req, ct);

      await HttpContext.SignInAsync(
        CookieAuthenticationDefaults.AuthenticationScheme,
        new ClaimsPrincipal(BuildIdentity(user, sessions.Start())));
        
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

  [Authorize]
  [HttpGet("me")]
  public async Task<ActionResult<UsuarioDTO>> Me(CancellationToken ct = default)
  {
    var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var id = int.Parse(idClaim);

    var user = await authService.GetSessionUserAsync(id, ct);

    if (user is null)
    {
      await EndSession();

      return Problem(
        statusCode: StatusCodes.Status401Unauthorized,
        title: "No autorizado",
        detail: "La sesión ya no es válida."
      );
    }

    return Ok(user);
  }

  [HttpPost("logout")]
  public async Task<IActionResult> Logout()
  {
    await EndSession();
    return NoContent();
  }

  private Task EndSession()
  {
    var sid = User.FindFirstValue(ClaimTypes.Sid);
    if (sid != null)
    {
      sessions.End(sid);
    }

    return HttpContext.SignOutAsync();
  }

  /// <summary>
  /// A partir de los datos de usuario obtenidos en el login, se
  /// crea la cookie con Id, NombreUsuario, Roles y Permisos.
  /// 
  /// Los Roles y Permisos sirven a los endpoints que necesitan
  /// usar Authorize para permitir el paso de la petición según
  /// el rol del usuario logueado.
  /// </summary>
  /// <param name="user">Datos del usuario logueado</param>
  /// <param name="sid">Identificador de la sesión que se abre</param>
  /// <returns>ClaimsIdentity con datos de la cookie</returns>
  private static ClaimsIdentity BuildIdentity(UsuarioDTO user, string sid)
  {
    var claims = new List<Claim>
    {
      new(ClaimTypes.NameIdentifier, user.Id.ToString()),
      new(ClaimTypes.Sid, sid),
    };
    claims.AddRange(user.Roles.Select(r => new Claim(ClaimTypes.Role, r)));

    // Warning: si los usuarios tienen MUCHOS permisos, evaluar el peso
    // de la cookie en KBs en cada petición
    claims.AddRange(user.Permisos.Select(p => new Claim("permiso", p)));

    return new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
  }
}