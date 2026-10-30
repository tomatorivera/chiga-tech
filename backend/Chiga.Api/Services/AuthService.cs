using Api.Exceptions;
using Api.Models.Dto;
using Api.Repositories;

namespace Api.Services;

public class AuthService(IUserRepository userRepository) : IAuthService
{
  public async Task<UsuarioDTO> LoginAsync(LoginRequestDTO req, CancellationToken ct = default)
  {
    // Postgres no admite '\0' en texto y ningún formulario lo produce: solo llega con un request
    // armado a mano, así que se trata como un usuario inexistente.
    var result = req.NombreUsuario.Contains('\0')
      ? null
      : await userRepository.FindByNombreUsuarioAsync(req.NombreUsuario.Trim(), ct);

    if (result is null || !PasswordMatches(req.Contrasena, result.Value.Contrasenia))
      throw new InvalidCredentialsException("Las credenciales son inválidas.");

    if (!result.Value.User.Estado)
      throw new DisabledUserException("La cuenta se encuentra inhabilitada, si cree que se trata de un error consulte con un administrador.");

    var usuario = result.Value.User;

    return new UsuarioDTO
    {
      Id = usuario.Id,
      NombreUsuario = usuario.NombreUsuario,
      Nombre = usuario.Nombre,
      Apellido = usuario.Apellido,
      Roles = usuario.Roles.Select(r => r.Nombre).ToList(),
      Permisos = usuario.Roles.SelectMany(r => r.Permisos).Select(p => p.Modulo).Distinct().ToList(),
    };
  }

  private static bool PasswordMatches(string password, string hash)
  {
    try
    {
      return BCrypt.Net.BCrypt.Verify(password, hash);
    }
    catch (Exception ex) when (ex is BCrypt.Net.SaltParseException or ArgumentException)
    {
      // TODO: loguear con ILogger<AuthService> que el hash guardado de este usuario no es bcrypt (dato corrupto)
      return false;
    }
  }
}