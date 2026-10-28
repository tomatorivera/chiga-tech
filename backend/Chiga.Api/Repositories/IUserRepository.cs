using Api.Models;

namespace Api.Repositories;

public interface IUserRepository
{
  Task<(Usuario usuario, string Contrasenia)?> FindByNombreUsuarioAsync(string nombreUsuario, CancellationToken ct = default);
}